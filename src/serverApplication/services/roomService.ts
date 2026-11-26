import type { Room } from "../../types";
import { getMessagesByRoomId } from "../dao/messageDAO";
import { getHashedPasswordForRoomName, getRoomByID, getRoomByRoomName, updateRoomMembers } from "../dao/roomDAO";
import { isCommonRoom } from "../utils/constants";
import { PasswordManager } from "../utils/passwordManager";

/**
 * @returns     true if userID is member of room with ID roomID
 */
export async function isMember(userID: string, roomID: string): Promise<boolean> {
    let isMember: boolean = false;

    try {
        const room: Room = await getRoomByID(roomID);
        if (room.id === roomID && room.members.includes(userID)) {
            isMember = true;
        }
    } catch (error) {
        console.log(error);
    }

    return isMember;
}

/**
 * Add a user to a room if the user is not already a member of the room. 
 */
export async function addUserToRoom(userID: string, roomName: string): Promise<void> {
    try {
        const room: Room = await getRoomByRoomName(roomName);
        const roomMembers: string[] = room.members;
        if (!roomMembers.includes(userID)) {
            roomMembers.push(userID);
            await updateRoomMembers(roomName, roomMembers);
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * Remove a user from room if the user is a member of the room. 
 */
export async function removeUserFromRoom(userID: string, roomID: string): Promise<void> {
    try {
        const room: Room = await getRoomByID(roomID);
        const roomMembers: string[] = room.members;
        if (roomMembers.includes(userID)) {
            const filteredMembers: string[] = roomMembers.filter((user: string) => user !== userID);
            await updateRoomMembers(room.name, filteredMembers);
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * Adds message history to the rooms the user may read: the common rooms and the rooms the user is a member of.
 */
export async function addMessageHistoryToRooms(rooms: Room[], userID: string): Promise<Room[]> {
    for (const room of rooms) {
        if (isCommonRoom(room.name) || room.members.includes(userID)) {
            try {
                room.history = await getMessagesByRoomId(room.id);
            } catch (error) {
                console.log(error);
            }
        }
    }

    return rooms;
}

export async function isCorrectPassword(roomName: string, password: string): Promise<boolean> {
    try {
        const hashedPassword = await getHashedPasswordForRoomName(roomName);
        return await PasswordManager.compare(hashedPassword, password);
    } catch (error) {
        console.log(error);
    }

    return false;
}