import type { ChatUser } from "../../types";
import { findUserByUsername } from "../dao/user";
import User from "../schemas/userSchema";

/**
 * Thus function may return undefined if a user has not been created yet.
 */
export async function getUserByUsername(username: string): Promise<ChatUser> {
    return await findUserByUsername(username);
}

export async function getUserById(userID: string): Promise<ChatUser> {
    const user = await User.findById(userID);
    if (user) {
        const mappedUser: ChatUser = {
            id: user._id.toString(),
            username: user.username,
            avatar: user.avatar,
            inCall: user.inCall,
            online: user.online
        }

        return mappedUser;
    }

    throw new Error(`Could not find user with ID ${userID}`);
}

/**
 * Maps database users to application users and returns the mapped users.
 */
export async function getUsers(): Promise<ChatUser[]> {
    const mappedUsers: ChatUser[] = [];

    try {
        const users = await User.find({});
        for (let i = 0; i < users.length; i++) {
            const mappedUser: ChatUser = {
                id: users[i]._id.toString(),
                username: users[i].username,
                avatar: users[i].avatar,
                inCall: users[i].inCall,
                online: users[i].online
            }

            mappedUsers.push(mappedUser);
        }
    } catch (error) {
        console.log(error);
    }

    return mappedUsers;
}

export async function updateUser(updatedUser: ChatUser): Promise<void> {
    await User.findOneAndUpdate({_id: updatedUser.id}, updatedUser);
}

export async function setUserOnline(userID: string, isOnline: boolean): Promise<void> {
    await User.findByIdAndUpdate(userID, { online: isOnline });
}