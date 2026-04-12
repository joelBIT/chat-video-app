import User from '../schemas/userSchema';
import type { ChatUser } from '../../types';

interface UserAttributes {
    username: string,
    password: string
}

/**
 * Create a new user in the database and return the newly created user as a ChatUser.
 */
export async function createUser(attributes: UserAttributes): Promise<ChatUser> {
    const newUser = await User.create(attributes);
    const createdUser: ChatUser = {username: newUser.username, id: newUser._id.toString(), online: newUser.online, avatar: newUser.avatar, inCall: newUser.inCall};
    
    return createdUser;
}

export async function findUserByUsername(username: string): Promise<ChatUser> {
    const user: ChatUser | null = await User.findOne({username});
    if (!user) {
        throw new Error(`Could not find user with username ${username}`);
    }

    return user;
}