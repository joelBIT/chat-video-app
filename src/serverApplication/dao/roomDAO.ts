import type { Room } from "../../types";
import RoomSchema from "../schemas/roomSchema";
import { AppError } from "../errors/AppError";

/**
 * Add a newly created room, if it does not already exist.
 *
 * @param room      the room to be persisted
 * @returns         the room with its new ID
 */
export async function saveRoom(room: Room): Promise<Room> {
    const exists = await RoomSchema.exists({ name: room.name });
    if (!exists) {
        const result = await RoomSchema.create({
            name: room.name,
            namespaceId: room.namespaceId,
            private: room.private
        });

        return mapDatabaseRoom(result);
    }

    throw new AppError(`Room with name ${room.name} already exist`, 400);
}

export async function addUserToRoom(userID: string, roomName: string): Promise<void> {
    try {
        const response = await RoomSchema.findOne({name: roomName});

        if (response && response.members) {
            const roomMembers: string[] = response.members;
            if (!roomMembers.includes(userID)) {
                roomMembers.push(userID);
                await RoomSchema.findOneAndUpdate({name: roomName}, { members: roomMembers });
            }
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
        const response = await RoomSchema.findById(roomID);

        if (response && response.members) {
            const roomMembers: string[] = response.members;
            if (roomMembers && roomMembers.includes(userID)) {
                const filteredMembers: string[] = roomMembers.filter((user: string) => user !== userID);
                await RoomSchema.findByIdAndUpdate(roomID, { members: filteredMembers });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

export async function getRoomByID(roomID: string): Promise<Room> {
    const room: Room | null = await RoomSchema.findById(roomID);

    if (room) {
        return mapDatabaseRoom(room);
    }

    throw new AppError(`No room with ID ${roomID} found`, 404);
}

/**
 * Map a database room object to a Room object used by the chat application.
 */
function mapDatabaseRoom(room: any): Room {
    return {
        id: room.id.toString(),
        name: room.name,
        namespaceId: room.namespaceId,
        private: room.private,
        members: room.members,
        history: []
    }
}