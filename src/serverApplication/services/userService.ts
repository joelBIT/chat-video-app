import type { ChatUser } from "../../types";
import { addUserToRoom } from "./roomService";
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

/**
 * Thus function may return undefined if a user has not been created yet.
 */
export function getUserByUsername(username: string): ChatUser | undefined {
    return userStore.findUserByUsername(username);
}