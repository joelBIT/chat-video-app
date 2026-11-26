import User from '../schemas/userSchema';
import type { ChatUser } from '../../types';
import { assertString } from '../utils/validate';

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
    assertString(username, "username");
    const user = await User.findOne({username});
    if (!user) {
        throw new Error(`Could not find user with username ${username}`);
    }

    return mapDatabaseUser(user);
}

export async function findUserById(userID: string): Promise<ChatUser> {
    assertString(userID, "userID");
    const user = await User.findById(userID);
    if (!user) {
        throw new Error(`Could not find user with ID ${userID}`);
    }

    return mapDatabaseUser(user);
}

export async function usernameExists(username: string): Promise<boolean> {
    assertString(username, "username");
    return (await User.exists({ username })) !== null;
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

/**
 * Online status is updated either when the user signs in or when the user signs out. Therefore, the lastActive property is also updated.
 */
export async function updateOnlineStatus(username: string, online: boolean): Promise<void> {
    await User.updateOne({ username }, { online, lastActive: Date.now() });
}


export async function getHashedPasswordForUsername(username: string): Promise<string> {
    assertString(username, "username");
    return (await User.findOne({username}))?.password ?? "";
}

export async function updateInCallStatus(userID: string, inCall: boolean): Promise<void> {
    await User.updateOne({ _id: userID }, { inCall });
}

export async function updateAvatar(userID: string, avatar: string): Promise<ChatUser> {
    const user = await User.findByIdAndUpdate(userID, { avatar }, { new: true });
    if (!user) {
        throw new Error(`Could not find user with ID ${userID}`);
    }

    return mapDatabaseUser(user);
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
        online: user.online,
        lastActive: user.lastActive
    }
}