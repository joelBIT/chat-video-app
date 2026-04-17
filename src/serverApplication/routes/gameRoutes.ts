import express from 'express';
import { checkRoomPassword } from '../controllers/roomController';
import { checkBody } from '../middleware/rooms';

const router = express.Router();

router
    .route('/')
    .post(checkBody, checkRoomPassword);

export default router;