import express from 'express';
import { AppError } from '../errors/AppError';

/**
 * Check if POST body contains required roomName and password properties. Only execute the checkRoomPassword function if properties exist.
 */
export function checkBody(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    if (!req.body.name || !req.body.password) {
        next(new AppError("Room name and password must be supplied.", 400));
    }

    next();
}