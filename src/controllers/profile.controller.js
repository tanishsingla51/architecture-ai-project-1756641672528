import Profile from '../models/Profile.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get current user's profile
// @route   GET /api/v1/profiles/me
// @access  Private
const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['name', 'email', 'profilePicture']);

  if (!profile) {
    throw new ApiError(404, 'There is no profile for this user');
  }

  res.status(200).json(new ApiResponse(200, profile));
});

// @desc    Create or update user profile
// @route   POST /api/v1/profiles/me
// @access  Private
const createOrUpdateProfile = asyncHandler(async (req, res) => {
  const { summary, location, website, skills, social } = req.body;

  const profileFields = { user: req.user.id };
  if (summary) profileFields.summary = summary;
  if (location) profileFields.location = location;
  if (website) profileFields.website = website;
  if (skills) {
    profileFields.skills = skills.split(',').map(skill => skill.trim());
  }
  if (social) profileFields.social = social;

  let profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: profileFields },
    { new: true, upsert: true }
  ).populate('user', ['name', 'email']);

  res.status(200).json(new ApiResponse(200, profile, 'Profile updated successfully'));
});

// @desc    Get all profiles
// @route   GET /api/v1/profiles
// @access  Public
const getAllProfiles = asyncHandler(async (req, res) => {
  const profiles = await Profile.find().populate('user', ['name', 'headline', 'profilePicture']);
  res.status(200).json(new ApiResponse(200, profiles));
});

// @desc    Get profile by user ID
// @route   GET /api/v1/profiles/user/:userId
// @access  Public
const getProfileByUserId = asyncHandler(async (req, res) => {
  const profile = await Profile.findOne({ user: req.params.userId }).populate('user', ['name', 'headline', 'profilePicture']);

  if (!profile) {
    throw new ApiError(404, 'Profile not found');
  }

  res.status(200).json(new ApiResponse(200, profile));
});

// @desc    Add profile experience
// @route   PUT /api/v1/profiles/experience
// @access  Private
const addExperience = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience.unshift(req.body);
    await profile.save();
    res.status(200).json(new ApiResponse(200, profile, 'Experience added'));
});

// @desc    Delete profile experience
// @route   DELETE /api/v1/profiles/experience/:exp_id
// @access  Private
const deleteExperience = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.experience = profile.experience.filter(exp => exp._id.toString() !== req.params.exp_id);
    await profile.save();
    res.status(200).json(new ApiResponse(200, profile, 'Experience removed'));
});

// @desc    Add profile education
// @route   PUT /api/v1/profiles/education
// @access  Private
const addEducation = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education.unshift(req.body);
    await profile.save();
    res.status(200).json(new ApiResponse(200, profile, 'Education added'));
});

// @desc    Delete profile education
// @route   DELETE /api/v1/profiles/education/:edu_id
// @access  Private
const deleteEducation = asyncHandler(async (req, res) => {
    const profile = await Profile.findOne({ user: req.user.id });
    profile.education = profile.education.filter(edu => edu._id.toString() !== req.params.edu_id);
    await profile.save();
    res.status(200).json(new ApiResponse(200, profile, 'Education removed'));
});


export {
  getCurrentUserProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation
};
