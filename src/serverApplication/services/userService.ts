import type { ChatUser } from "../../types";
import { findUserById, findUserByUsername } from "../dao/userDAO";
import User from "../schemas/userSchema";

/**
 * Thus function may return undefined if a user has not been created yet.
 */
export async function getUserByUsername(username: string): Promise<ChatUser> {
    return await findUserByUsername(username);
}

export async function getUserById(userID: string): Promise<ChatUser> {
    return await findUserById(userID);
}

export async function updateUser(updatedUser: ChatUser): Promise<void> {
    await User.findOneAndUpdate({_id: updatedUser.id}, updatedUser);
}

export async function setUserOnline(userID: string, isOnline: boolean): Promise<void> {
    await User.findByIdAndUpdate(userID, { online: isOnline });
}