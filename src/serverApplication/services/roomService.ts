import type { Room } from "../../types";
import { getMessagesByRoomId } from "../dao/messageDAO";
import { getRoomByID, getRoomByRoomName, updateRoomMembers } from "../dao/roomDAO";
import { isCommonRoom } from "../utils/constants";

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
 * Adds message history to supplied rooms.
 */
export async function addMessageHistoryToRooms(rooms: Room[]): Promise<Room[]> {
    for (let i = 0; i < rooms.length; i++) {
        if (isCommonRoom(rooms[i].name)) {          // Only retrieve message history for the common rooms
            try {
                const roomMessages = await getMessagesByRoomId(rooms[i].id);
                rooms[i].history.push(...roomMessages);
            } catch (error) {
                console.log(error);
            }
        }
    }

    return rooms;
}