import Connection from '../models/Connection.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import mongoose from 'mongoose';

// @desc    Send a connection request
// @route   POST /api/v1/connections/request/:recipientId
// @access  Private
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const requesterId = req.user.id;
  const recipientId = req.params.recipientId;

  if (requesterId === recipientId) {
    throw new ApiError(400, 'You cannot connect with yourself');
  }

  const existingConnection = await Connection.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId },
      { requester: recipientId, recipient: requesterId },
    ],
  });

  if (existingConnection) {
    throw new ApiError(400, `Connection request already ${existingConnection.status}`);
  }

  const newConnection = await Connection.create({
    requester: requesterId,
    recipient: recipientId,
  });

  res.status(201).json(new ApiResponse(201, newConnection, 'Connection request sent'));
});

// @desc    Accept a connection request
// @route   PUT /api/v1/connections/accept/:requestId
// @access  Private
const acceptConnectionRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.requestId);

  if (!connection) {
    throw new ApiError(404, 'Connection request not found');
  }

  if (connection.recipient.toString() !== req.user.id) {
    throw new ApiError(401, 'Not authorized to perform this action');
  }

  if (connection.status !== 'pending') {
    throw new ApiError(400, 'Request is not pending');
  }

  connection.status = 'accepted';
  await connection.save();

  // Add each user to the other's connections list
  await User.findByIdAndUpdate(connection.requester, { $addToSet: { connections: connection.recipient } });
  await User.findByIdAndUpdate(connection.recipient, { $addToSet: { connections: connection.requester } });

  res.status(200).json(new ApiResponse(200, connection, 'Connection request accepted'));
});

// @desc    Decline a connection request
// @route   PUT /api/v1/connections/decline/:requestId
// @access  Private
const declineConnectionRequest = asyncHandler(async (req, res) => {
    const connection = await Connection.findById(req.params.requestId);

    if (!connection || connection.recipient.toString() !== req.user.id) {
        throw new ApiError(401, 'Not authorized or request not found');
    }

    connection.status = 'declined';
    await connection.save();

    res.status(200).json(new ApiResponse(200, {}, 'Connection request declined'));
});

// @desc    Remove a connection
// @route   DELETE /api/v1/connections/remove/:userId
// @access  Private
const removeConnection = asyncHandler(async (req, res) => {
    const userToRemoveId = req.params.userId;
    const currentUserId = req.user.id;

    // Remove from both users' connection lists
    await User.findByIdAndUpdate(currentUserId, { $pull: { connections: userToRemoveId } });
    await User.findByIdAndUpdate(userToRemoveId, { $pull: { connections: currentUserId } });

    // Delete the connection document
    await Connection.findOneAndDelete({
        $or: [
            { requester: currentUserId, recipient: userToRemoveId, status: 'accepted' },
            { requester: userToRemoveId, recipient: currentUserId, status: 'accepted' },
        ]
    });

    res.status(200).json(new ApiResponse(200, {}, 'Connection removed'));
});

// @desc    Get pending connection requests for logged in user
// @route   GET /api/v1/connections/pending
// @access  Private
const getPendingRequests = asyncHandler(async (req, res) => {
    const requests = await Connection.find({ recipient: req.user.id, status: 'pending' })
        .populate('requester', 'name headline profilePicture');

    res.status(200).json(new ApiResponse(200, requests));
});

// @desc    Get all connections for logged in user
// @route   GET /api/v1/connections
// @access  Private
const getConnections = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
        .populate('connections', 'name headline profilePicture');

    res.status(200).json(new ApiResponse(200, user.connections));
});

export {
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    removeConnection,
    getPendingRequests,
    getConnections
};
