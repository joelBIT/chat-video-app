import type { ChatUser, Room } from "../../types";
import { ROOM_NAME_ANNOUNCEMENTS, ROOM_NAME_GENERAL, ROOM_NAME_LOBBY, ROOM_NAME_SUPPORT } from "../utils";
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

        const createdRoom: Room = {
            id: result.id.toString(),
            name: result.name,
            namespaceId: result.namespaceId,
            private: result.private,
            members: [],
            history: []
        }

        return createdRoom;
    }

    throw new AppError(`Room with name ${room.name} already exist`, 400);
}

/**
 * Add a user to room if the user is not already a member of the room. 
 */
export async function addUserToRoom(userID: string, roomName: string): Promise<void> {
   await addUserToCommonRoom(userID, roomName);
}

/**
 * Add a new application user. All users are members of the 4 rooms "General", "Support", "Announcements", and "Lobby" so a new user
 * must be added as member of these rooms.
 */
export async function addUserToCommonRooms(user: ChatUser): Promise<void> {
    addUserToCommonRoom(user.id, ROOM_NAME_GENERAL);
    addUserToCommonRoom(user.id, ROOM_NAME_SUPPORT);
    addUserToCommonRoom(user.id, ROOM_NAME_ANNOUNCEMENTS);
    addUserToCommonRoom(user.id, ROOM_NAME_LOBBY);
}

async function addUserToCommonRoom(userID: string, roomName: string): Promise<void> {
    const response = await RoomSchema.findOne({name: roomName});

    if (response && response.members) {
        const roomMembers: string[] = response.members;
        if (!roomMembers.includes(userID)) {
            roomMembers.push(userID);
            await RoomSchema.findOneAndUpdate({name: roomName}, { members: roomMembers });
        }
    }
}

/**
 * Remove a user from room if the user is a member of the room. 
 */
export async function removeUserFromRoom(userID: string, roomID: string): Promise<void> {
    const response = await RoomSchema.findById(roomID);

    if (response && response.members) {
        const roomMembers: string[] = response.members;
        if (roomMembers && roomMembers.includes(userID)) {
            const filteredMembers: string[] = roomMembers.filter((user: string) => user !== userID);
            await RoomSchema.findByIdAndUpdate(roomID, { members: filteredMembers });
        }
    }
}

export async function getRoomByID(roomID: string): Promise<Room> {
    const room: Room | null = await RoomSchema.findById(roomID);

    if (room) {
        const createdRoom: Room = {
            id: room.id.toString(),
            name: room.name,
            namespaceId: room.namespaceId,
            private: room.private,
            members: room.members,
            history: []                 // TODO: Add message history?
        }

        return createdRoom;
    }

    throw new AppError(`No room with ID ${roomID} found`, 404);
}

/**
 * @returns     true if userID is member of room with ID roomID
 */
export async function isMember(userID: string, roomID: string): Promise<boolean> {
    let isMember: boolean = false;
    const room: Room | null = await RoomSchema.findById(roomID);

    if (room && room.id === roomID && room.members.includes(userID)) {
        isMember = true;
    }

    return isMember;
}