import type { ChatUser } from "../../types";
import { addUserToRoom } from "./roomService";
import { NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME, ROOM_ID_ANNOUNCEMENTS, ROOM_ID_GENERAL, ROOM_ID_LOBBY, ROOM_ID_SUPPORT } from "../utils";
import User from "../schemas/userSchema";

/**
 * Add a new application user. All users are members of the 4 rooms "General", "Support", "Announcements", and "Lobby" so a new user
 * must be added as member of these rooms.
 */
export function addUserToCommonRooms(user: ChatUser): void {
    addUserToRoom(user.id, ROOM_ID_GENERAL, NAMESPACE_ID_HOME);
    addUserToRoom(user.id, ROOM_ID_SUPPORT, NAMESPACE_ID_HOME);
    addUserToRoom(user.id, ROOM_ID_ANNOUNCEMENTS, NAMESPACE_ID_HOME);
    addUserToRoom(user.id, ROOM_ID_LOBBY, NAMESPACE_ID_GAMES);
}

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