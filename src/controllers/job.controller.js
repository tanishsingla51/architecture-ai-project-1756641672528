import Job from '../models/Job.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Create a new job posting
// @route   POST /api/v1/jobs
// @access  Private (Recruiters/Admins)
const createJob = asyncHandler(async (req, res) => {
  const { company, title, description, location, jobType } = req.body;

  if (!company || !title || !description || !location) {
    throw new ApiError(400, 'Please provide all required fields');
  }

  const job = await Job.create({
    company,
    title,
    description,
    location,
    jobType,
    postedBy: req.user.id,
  });

  res.status(201).json(new ApiResponse(201, job, 'Job created successfully'));
});

// @desc    Get all job postings
// @route   GET /api/v1/jobs
// @access  Public
const getAllJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('postedBy', 'name');
  res.status(200).json(new ApiResponse(200, jobs));
});

// @desc    Get a single job by ID
// @route   GET /api/v1/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate('postedBy', 'name company');

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  res.status(200).json(new ApiResponse(200, job));
});

// @desc    Update a job posting
// @route   PUT /api/v1/jobs/:id
// @access  Private
const updateJob = asyncHandler(async (req, res) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  // Check if user is the one who posted the job
  if (job.postedBy.toString() !== req.user.id) {
    throw new ApiError(401, 'Not authorized to update this job');
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json(new ApiResponse(200, job, 'Job updated successfully'));
});

// @desc    Delete a job posting
// @route   DELETE /api/v1/jobs/:id
// @access  Private
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    throw new ApiError(404, 'Job not found');
  }

  if (job.postedBy.toString() !== req.user.id) {
    throw new ApiError(401, 'Not authorized to delete this job');
  }

  await job.deleteOne();

  res.status(200).json(new ApiResponse(200, {}, 'Job deleted successfully'));
});

// @desc    Apply to a job
// @route   POST /api/v1/jobs/:id/apply
// @access  Private
const applyToJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        throw new ApiError(404, 'Job not found');
    }

    if (job.applicants.some(app => app.user.toString() === req.user.id)) {
        throw new ApiError(400, 'You have already applied for this job');
    }

    const application = {
        user: req.user.id,
        resumeUrl: req.body.resumeUrl // Assuming resume URL is sent in the body
    };

    job.applicants.push(application);
    await job.save();

    res.status(200).json(new ApiResponse(200, job.applicants, 'Successfully applied to job'));
});

export { createJob, getAllJobs, getJobById, updateJob, deleteJob, applyToJob };
