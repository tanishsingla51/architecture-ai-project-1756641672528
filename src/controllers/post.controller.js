import Post from '../models/Post.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Create a post
// @route   POST /api/v1/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  const newPost = new Post({
    text: req.body.text,
    user: req.user.id,
  });

  const post = await newPost.save();
  res.status(201).json(new ApiResponse(201, post, 'Post created'));
});

// @desc    Get all posts (e.g., for a feed)
// @route   GET /api/v1/posts
// @access  Private
const getAllPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('user', ['name', 'profilePicture']);
  res.status(200).json(new ApiResponse(200, posts));
});

// @desc    Get post by ID
// @route   GET /api/v1/posts/:id
// @access  Private
const getPostById = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate('user', ['name', 'profilePicture']);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  res.status(200).json(new ApiResponse(200, post));
});

// @desc    Delete a post
// @route   DELETE /api/v1/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.user.toString() !== req.user.id) {
    throw new ApiError(401, 'User not authorized');
  }

  await post.deleteOne();
  res.status(200).json(new ApiResponse(200, {}, 'Post removed'));
});

// @desc    Like a post
// @route   PUT /api/v1/posts/like/:id
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  // Check if the post has already been liked by this user
  if (post.likes.some(like => like.user.toString() === req.user.id)) {
    throw new ApiError(400, 'Post already liked');
  }

  post.likes.unshift({ user: req.user.id });
  await post.save();

  res.status(200).json(new ApiResponse(200, post.likes));
});

// @desc    Unlike a post
// @route   PUT /api/v1/posts/unlike/:id
// @access  Private
const unlikePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  // Check if the post has not yet been liked
  if (!post.likes.some(like => like.user.toString() === req.user.id)) {
    throw new ApiError(400, 'Post has not yet been liked');
  }

  post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id);
  await post.save();

  res.status(200).json(new ApiResponse(200, post.likes));
});

// @desc    Comment on a post
// @route   POST /api/v1/posts/comment/:id
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  const post = await Post.findById(req.params.id);

  const newComment = {
    text: req.body.text,
    name: user.name,
    profilePicture: user.profilePicture,
    user: req.user.id,
  };

  post.comments.unshift(newComment);
  await post.save();

  res.status(201).json(new ApiResponse(201, post.comments, 'Comment added'));
});

// @desc    Delete comment
// @route   DELETE /api/v1/posts/comment/:id/:comment_id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  const comment = post.comments.find(c => c.id === req.params.comment_id);
  if (!comment) {
    throw new ApiError(404, 'Comment does not exist');
  }

  if (comment.user.toString() !== req.user.id) {
    throw new ApiError(401, 'User not authorized');
  }

  post.comments = post.comments.filter(({ id }) => id !== req.params.comment_id);
  await post.save();

  res.status(200).json(new ApiResponse(200, post.comments, 'Comment removed'));
});

export {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
};
