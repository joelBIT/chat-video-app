import express from 'express';
import { checkBody, registerUser } from '../controllers/authController';

const router = express.Router();

router
    .route('/')
    .post(checkBody, registerUser);


export default router;