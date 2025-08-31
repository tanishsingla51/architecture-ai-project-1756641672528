import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
} from '../controllers/post.controller.js';

const router = Router();

router.route('/')
  .post(protect, createPost)
  .get(protect, getAllPosts);

router.route('/:id')
  .get(protect, getPostById)
  .delete(protect, deletePost);

router.put('/like/:id', protect, likePost);
router.put('/unlike/:id', protect, unlikePost);

router.post('/comment/:id', protect, addComment);
router.delete('/comment/:id/:comment_id', protect, deleteComment);

export default router;
