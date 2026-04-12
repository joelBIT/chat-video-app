import type { Room } from "../../types";
import { getRoomByID, getRoomByRoomName, updateRoomMembers } from "../dao/roomDAO";

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