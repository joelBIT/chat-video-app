import { getHashedPasswordForUsername } from '../dao/userDAO';
import { ROOM_NAME_ANNOUNCEMENTS, ROOM_NAME_GENERAL, ROOM_NAME_LOBBY, ROOM_NAME_SUPPORT } from '../utils/constants';
import { PasswordManager } from '../utils/passwordManager';
import { addUserToRoom } from './roomService';

export async function isCorrectPassword(username: string, password: string): Promise<boolean> {
    try {
        const hashedPassword = await getHashedPasswordForUsername(username);
        return await PasswordManager.compare(hashedPassword, password);
    } catch (error) {
        console.log(error);
    }

    return false;
}

/**
 * Add a new application user. All users are members of the 4 rooms "General", "Support", "Announcements", and "Lobby" so a new user
 * must be added as member of these rooms.
 */
export async function addUserToCommonRooms(userID: string): Promise<void> {
    addUserToRoom(userID, ROOM_NAME_GENERAL);
    addUserToRoom(userID, ROOM_NAME_SUPPORT);
    addUserToRoom(userID, ROOM_NAME_ANNOUNCEMENTS);
    addUserToRoom(userID, ROOM_NAME_LOBBY);
}