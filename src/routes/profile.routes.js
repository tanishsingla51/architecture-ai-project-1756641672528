import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  getCurrentUserProfile,
  createOrUpdateProfile,
  getAllProfiles,
  getProfileByUserId,
  addExperience,
  deleteExperience,
  addEducation,
  deleteEducation
} from '../controllers/profile.controller.js';

const router = Router();

router.route('/')
  .get(getAllProfiles);

router.route('/me')
  .get(protect, getCurrentUserProfile)
  .post(protect, createOrUpdateProfile);

router.route('/user/:userId')
  .get(getProfileByUserId);

router.route('/experience')
    .put(protect, addExperience);

router.route('/experience/:exp_id')
    .delete(protect, deleteExperience);

router.route('/education')
    .put(protect, addEducation);

router.route('/education/:edu_id')
    .delete(protect, deleteEducation);

export default router;
