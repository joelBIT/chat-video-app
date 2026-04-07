import type { ChatUser, Room } from "../../types";
import { NAMESPACE_ID_GAMES, ROOM_NAME_ANNOUNCEMENTS, ROOM_NAME_GENERAL, ROOM_NAME_LOBBY, ROOM_NAME_SUPPORT } from "../utils";
import RoomSchema from "../schemas/roomSchema";

/**
 * Add a newly created Game room, if it does not already exist.
 *
 * @param room      the room to be persisted
 * @returns         the room with its new ID
 */
export async function saveGameRoom(room: Room): Promise<Room> {
    const exists = await RoomSchema.exists({ name: room.name });
    if (!exists) {
        const newRoom = new RoomSchema({
            name: room.name,
            namespaceId: NAMESPACE_ID_GAMES,
            private: room.private
        });

        const result = await newRoom.save();
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

    throw new Error(`Room with name ${room.name} already exist`);
}

/**
 * Add a user to room if the user is not already a member of the room. 
 */
export async function addUserToRoom(userID: string, roomID: string): Promise<void> {
   await addUserToCommonRoom(userID, roomID);
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

async function addUserToCommonRoom(userID: string, roomID: string): Promise<void> {
    const response = await RoomSchema.findById(roomID);

    if (response && response.members) {
        const roomMembers: string[] = response.members;
        if (!roomMembers.includes(userID)) {
            roomMembers.push(userID);
            await RoomSchema.findOneAndUpdate({ _id: roomID }, { members: roomMembers });
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
            await RoomSchema.findOneAndUpdate({ _id: roomID }, { members: filteredMembers });
        }
    }
}

export async function getRoomByID(roomID: string): Promise<Room> {
    const room: Room | null = await RoomSchema.findById(roomID);
    if (room) {
        room.history = [];          // TODO: Add message history?
        return room;
    }

    throw new Error(`No room with ID ${roomID} found`);
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