import type { ChatUser } from "../../types";
import User from "../schemas/userSchema";

/**
 * Thus function may return undefined if a user has not been created yet.
 */
export async function getUserByUsername(username: string): Promise<ChatUser | null> {
    return await User.findOne({username});
}

export async function getUserById(id: string): Promise<ChatUser | null> {
    return await User.findById(id);
}

export async function getUsers(): Promise<ChatUser[]> {
    return await User.find({});
}

export async function updateUser(updatedUser: ChatUser): Promise<void> {
    await User.findOneAndUpdate({_id: updatedUser.id}, updatedUser);
}

export async function setUserOnline(userID: string, isOnline: boolean): Promise<void> {
    await User.updateOne({ _id: userID }, { online: isOnline });
}