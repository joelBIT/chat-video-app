import express from 'express';
import mongoose from 'mongoose';
import { addUserToCommonRooms } from '../services/userService';
import { AppError } from '../errors/AppError';
import { createUser, usernameExists } from '../dao/userDAO';

/**
 * Create new user in database if username is available.
 */
export async function registerUser(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    const { username, password, passwordRepeat } = req.body;        // checkBody has verified that these are strings

    if (password !== passwordRepeat) {
        return next(new AppError("Passwords do not match.", 400));
    }

    try {
        if (await usernameExists(username)) {
            return next(new AppError(`Username ${username} is already in use. Choose a different username.`, 400));
        }

        const newUser = await createUser({ username, password });
        await addUserToCommonRooms(newUser.id);

        res.status(201).json({
            success: true,
            message: `${newUser.username} successfully registered.`,
            data: newUser
        });
    } catch (error) {
        // Two registrations with the same name can both pass the check above; the unique index decides.
        if ((error as { code?: number }).code === 11000) {
            return next(new AppError(`Username ${username} is already in use. Choose a different username.`, 400));
        }

        if (error instanceof mongoose.Error.ValidationError) {
            return next(new AppError(error.message, 400));
        }

        console.log(error);
        next(new AppError("An error occurred during registration.", 500));
    }
}