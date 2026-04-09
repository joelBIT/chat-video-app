import express from 'express';
import type { ChatUser } from '../../types';
import User from '../schemas/userSchema';
import { addUserToCommonRooms } from '../services/roomService';
import { AppError } from '../errors/AppError';

/**
 * Create new user in database if username is not already taken.
 */
export async function registerUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const passwordRepeat: string = req.body.passwordRepeat;
    if (password !== passwordRepeat) {
        next(new AppError("Passwords do not match.", 400));
    }

    const user: ChatUser | null = await User.findOne({username});
    if (user) {
        next(new AppError(`Username ${username} is already in use. Choose a different username.`, 400));
    }

    try {
        const newUser = await User.create({
            username,
            password
        });

        const createdUser: ChatUser = {username: newUser.username, id: newUser._id.toString(), online: newUser.online, avatar: newUser.avatar, inCall: newUser.inCall};
        addUserToCommonRooms(createdUser);

        res.status(201).json({
            success: true,
            message: `${newUser.username} successfully registered.`,
            data: createdUser
        });
    } catch (error) {
        next(new AppError("An error occurred during registration.", 500));
    }
}

/**
 * Check if POST body contains required username and password properties. Only execute the registerUser function if properties exist.
 */
export function checkBody(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    if (!req.body.username || !req.body.password) {
        next(new AppError("Username and password must be supplied.", 400));
    }

    next();
}