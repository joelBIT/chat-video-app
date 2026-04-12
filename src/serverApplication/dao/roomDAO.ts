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