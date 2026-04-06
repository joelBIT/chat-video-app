import type { ChatUser } from "../../types";
import User from "../schemas/userSchema";

/**
 * Thus function may return undefined if a user has not been created yet.
 */
export async function getUserByUsername(username: string): Promise<ChatUser | null> {
    const user = await User.findOne({username});
    if (user) {
        return await mapUser(user._id.toString());      // TODO: Only do 1 call to the database
    }
    
    throw new Error(`Could not find user with username ${username}`);
}

export async function getUserById(id: string): Promise<ChatUser | null> {
    return await mapUser(id);
}

/**
 * Maps database users to application users and returns the mapped users.
 */
export async function getUsers(): Promise<ChatUser[]> {
    const users = await User.find({});
    const mappedUsers: ChatUser[] = [];
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

    return mappedUsers;
}

export async function updateUser(updatedUser: ChatUser): Promise<void> {
    await User.findOneAndUpdate({_id: updatedUser.id}, updatedUser);
}

export async function setUserOnline(userID: string, isOnline: boolean): Promise<void> {
    await User.updateOne({ _id: userID }, { online: isOnline });
}

async function mapUser(userID: string): Promise<ChatUser> {
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