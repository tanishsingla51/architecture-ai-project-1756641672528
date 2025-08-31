import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, headline } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, 'Please provide name, email, and password');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new ApiError(400, 'User already exists');
  }

  const user = await User.create({ name, email, password, headline });

  if (user) {
    const token = user.getSignedJwtToken();
    res.status(201).json(new ApiResponse(201, { token }, 'User registered successfully'));
  } else {
    throw new ApiError(400, 'Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/v1/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide an email and password');
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = user.getSignedJwtToken();
    res.status(200).json(new ApiResponse(200, { token }, 'User logged in successfully'));
  } else {
    throw new ApiError(401, 'Invalid credentials');
  }
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  // req.user is set by the protect middleware
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json(new ApiResponse(200, user));
});

export { registerUser, loginUser, getMe };
