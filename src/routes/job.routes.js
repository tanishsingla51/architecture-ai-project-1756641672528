import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob
} from '../controllers/job.controller.js';

const router = Router();

router.route('/')
  .post(protect, createJob) // Assuming only authenticated users can post jobs
  .get(getAllJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, updateJob)
  .delete(protect, deleteJob);

router.route('/:id/apply').post(protect, applyToJob);

export default router;
