import express from 'express';
import type { ChatUser } from '../../types';
import User from '../schemas/userSchema';
import { addUserToCommonRooms } from '../services/roomService';

/**
 * Create new user in database if username is not already taken.
 */
export async function registerUser(req: express.Request, res: express.Response): Promise<void> {
    const username: string = req.body.username;
    const password: string = req.body.password;
    const passwordRepeat: string = req.body.passwordRepeat;
    if (password !== passwordRepeat) {
        res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    } else {
        const user: ChatUser | null = await User.findOne({username});
        if (user) {
            res.status(400).json({
                success: false,
                message: `Username ${username} is already in use. Choose a different username.`
            });
        } else {
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
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: "An error occurred during registration."
                });
            }
        }
    }
}

/**
 * Check if POST body contains required username and password properties. Only execute the registerUser function if properties exist.
 */
export function checkBody(req: express.Request, res: express.Response, next: express.NextFunction): express.Response | undefined {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            success: false,
            message: "Username and password must be supplied."
        });
    }

    next();
}
