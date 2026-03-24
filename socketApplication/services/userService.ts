import type { ChatUser } from "../../src/types";
import { addUserToRoom } from "../services/roomService";
import userStore from "../stores/UserStore";
import { NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME, ROOM_ID_ANNOUNCEMENTS, ROOM_ID_GENERAL, ROOM_ID_LOBBY, ROOM_ID_SUPPORT } from "../utils";

/**
 * Add a new application user. All users are members of the 4 rooms "General", "Support", "Announcements", and "Lobby" so a new user
 * must be added as member of these rooms.
 */
export function saveUser(user: ChatUser): void {
    userStore.saveUser(user);
    addUserToRoom(user.id, ROOM_ID_GENERAL, NAMESPACE_ID_HOME);
    addUserToRoom(user.id, ROOM_ID_SUPPORT, NAMESPACE_ID_HOME);
    addUserToRoom(user.id, ROOM_ID_ANNOUNCEMENTS, NAMESPACE_ID_HOME);
    addUserToRoom(user.id, ROOM_ID_LOBBY, NAMESPACE_ID_GAMES);
}

export function getUserByID(userID: string): ChatUser {
    return userStore.findUserByID(userID);
}

/**
 * Thus function may return undefined if a user has not been created yet.
 */
export function getUserByUsername(username: string): ChatUser | undefined {
    return userStore.findUserByUsername(username);
}

export function getAllUsers(): ChatUser[] {
    return userStore.getAllUsers();
}

export function setOnlineStatusForUser(userID: string, online: boolean): void {
    const user: ChatUser = userStore.findUserByID(userID);
    const updatedUser: ChatUser = {username: user.username, id: user.id, online, avatar: user.avatar, inCall: user.inCall};
    userStore.saveUser(updatedUser);
}