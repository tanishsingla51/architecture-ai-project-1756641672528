import { Router } from 'express';
import authRouter from './auth.routes.js';
import profileRouter from './profile.routes.js';
import postRouter from './post.routes.js';
import connectionRouter from './connection.routes.js';
import jobRouter from './job.routes.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/profiles', profileRouter);
router.use('/posts', postRouter);
router.use('/connections', connectionRouter);
router.use('/jobs', jobRouter);

export default router;
