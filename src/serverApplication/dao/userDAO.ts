import User from '../schemas/userSchema';
import type { ChatUser } from '../../types';

interface Credentials {
    username: string,
    password: string
}

/**
 * Create a new user in the database and return the newly created user as a ChatUser.
 */
export async function createUser(credentials: Credentials): Promise<ChatUser> {
    const newUser = await User.create(credentials);
    return mapDatabaseUser(newUser);
}

export async function findUserByUsername(username: string): Promise<ChatUser> {
    const user = await User.findOne({username});
    if (!user) {
        throw new Error(`Could not find user with username ${username}`);
    }

    return mapDatabaseUser(user);
}

export async function findUserById(userID: string): Promise<ChatUser> {
    const user = await User.findById(userID);
    if (!user) {
        throw new Error(`Could not find user with ID ${userID}`);
    }

    return mapDatabaseUser(user);
}

export async function getAllUsers(): Promise<ChatUser[]> {
    const mappedUsers: ChatUser[] = [];

    try {
        const users = await User.find({});
        for (let i = 0; i < users.length; i++) {
            mappedUsers.push(mapDatabaseUser(users[i]));
        }
    } catch (error) {
        console.log(error);
    }

    return mappedUsers;
}

export async function updateOnlineStatus(username: string, online: boolean): Promise<void> {
    await User.updateOne({ username }, { online });
}

export async function updateUser(updatedUser: ChatUser): Promise<void> {
    await User.findOneAndUpdate({_id: updatedUser.id}, updatedUser);
}

export async function getHashedPasswordForUsername(username: string): Promise<string> {
    return (await User.findOne({username}))?.password ?? "";
}

/**
 * Map a database user object to a ChatUser object used by the chat application.
 */
function mapDatabaseUser(user: any): ChatUser {
    return {
        id: user._id.toString(),
        username: user.username,
        avatar: user.avatar,
        inCall: user.inCall,
        online: user.online
    }
}