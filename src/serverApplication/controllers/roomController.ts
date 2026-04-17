import express from 'express';
import { isCorrectPassword } from '../services/roomService';
import { AppError } from '../errors/AppError';
import type { ActionState } from '../../types';

/**
 * Check if supplied room password matches the stored room password.
 */
export async function checkRoomPassword(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const roomName: string = req.body.name;
    const password: string = req.body.password;

    try {
        const isCorrect: boolean = await isCorrectPassword(roomName, password);
        if (!isCorrect) {
            const message: ActionState = {
                success: false,
                message: `Supplied password for room ${roomName} is wrong`
            }
            res.status(400).json(message);
        } else {
            const message: ActionState = {
                success: true,
                message: `Passwords match.`
            }

            res.status(200).json(message);
        }
    } catch (error) { 
        next(new AppError("An error occurred during password comparison.", 500));
    }
}