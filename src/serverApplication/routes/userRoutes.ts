import express from 'express';
import { registerUser } from '../controllers/authController';
import { checkBody } from '../middleware/auth';

const router = express.Router();

router
    .route('/')
    .post(checkBody, registerUser);

export default router;