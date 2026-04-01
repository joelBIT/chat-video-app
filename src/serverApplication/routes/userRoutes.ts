import express from 'express';
import type { ChatUser } from '../../types';
import User from '../schemas/userSchema';
import { addUserToCommonRooms } from '../services/roomService';

const router = express.Router();

router
    .route('/')
    .post(checkBody, registerUser);

/**
 * Create new user in database if username is not already taken.
 */
async function registerUser(req: express.Request, res: express.Response): Promise<void> {
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
            const dbUser = new User({
                username,
                password
            });

            await dbUser.save().then(doc => {
                const createdUser: ChatUser = {username: doc.username, id: doc._id.toString(), online: doc.online, avatar: doc.avatar, inCall: doc.inCall};
                
                addUserToCommonRooms(createdUser);

                res.status(201).json({
                    success: true,
                    message: `${doc.username} successfully registered.`,
                    data: createdUser
                });
            }).catch(error => {
                console.log(error);
                res.status(500).json({
                    success: false,
                    message: "An error occurred during registration."
                });
            });
        }
    }
}

/**
 * Check if POST body contains required username and password properties. Only execute the registerUser function if properties exist.
 */
function checkBody(req: express.Request, res: express.Response, next: express.NextFunction): express.Response | undefined {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({
            success: false,
            message: "Username and password must be supplied."
        });
    }

    next();
}

export default router;