import express from 'express';
import type { ChatUser } from '../../types';
import { addUserToCommonRooms } from '../services/roomService';
import { AppError } from '../errors/AppError';
import { createUser, findUserByUsername } from '../dao/userDAO';

/**
 * Create new user in database if username is available.
 */
export async function registerUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const passwordRepeat: string = req.body.passwordRepeat;
    if (password !== passwordRepeat) {
        next(new AppError("Passwords do not match.", 400));
    }

    try {
        const user: ChatUser = await findUserByUsername(username);
        if (user) {
            next(new AppError(`Username ${username} is already in use. Choose a different username.`, 400));
        }
    } catch (error) { /** The user does not exist. Create a new user */ }
    
    try {
        const newUser = await createUser({
            username,
            password
        })

        addUserToCommonRooms(newUser);

        res.status(201).json({
            success: true,
            message: `${newUser.username} successfully registered.`,
            data: newUser
        });
    } catch (error) {
        next(new AppError("An error occurred during registration.", 500));
    }
}