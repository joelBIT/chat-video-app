/**
 * Names of custom events used in the application.
 */
export const CHAT_MESSAGE = 'chat-message';
export const PRIVATE_MESSAGE = 'private-message';
export const CHANGE_ROOM = 'change-room';
export const USER_JOINED = 'user-joined';
export const CREATE_ROOM = 'create-room';
export const LEAVE_ROOM = 'leave-room';
export const USER_LEFT = 'user-left';
export const UPDATE_ROOMS = 'update-rooms';
export const UPDATE_CUSTOM_GAME_ROOM = 'update-custom-game-room';
export const USER_CONNECTED = 'user-connected';
export const USER_DISCONNECTED = 'user-disconnected';
export const USER_UPDATED = 'user-updated';
export const NAMESPACES = 'namespaces';
export const NEW_OFFER = 'new-offer';
export const NEW_ANSWER = 'new-answer';
export const ANSWER_RESPONSE = 'answer-response';

// Namespace IDs can only be these.
export const NAMESPACE_ID_NONE = -1;        // ID -1 means no namespace is selected.
export const NAMESPACE_ID_HOME = 0;
export const NAMESPACE_ID_DM = 1;
export const NAMESPACE_ID_GAMES = 2;

// These are the common rooms that all users are members of. Other client-created rooms have long random strings as IDs.
export const ROOM_ID_NONE = "-1";           // ID "-1" means no room is selected.
export const ROOM_ID_GENERAL = "0";
export const ROOM_ID_SUPPORT = "1";
export const ROOM_ID_ANNOUNCEMENTS = "2";
export const ROOM_ID_LOBBY = "3";

export function isCommonRoom(roomID: string): boolean {
    return ["0", "1", "2", "3"].includes(roomID);
}

export function isValidNamespace(namespaceID: number): boolean {
    return [0, 1, 2].includes(namespaceID);
}

export const HOME_URL = "/";
export const ROOMS_URL = "/rooms";
export const PROFILE_URL = "/profile";