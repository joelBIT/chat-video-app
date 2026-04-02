import crypto from "node:crypto";
import type { ChatUser, Namespace, Room } from "../../types";
import namespaceStore from "../stores/NamespaceStore";
import { NAMESPACE_ID_GAMES, ROOM_NAME_ANNOUNCEMENTS, ROOM_NAME_GENERAL, ROOM_NAME_LOBBY, ROOM_NAME_SUPPORT } from "../utils";
import RoomSchema from "../schemas/roomSchema";

/**
 * Add a newly created Game room. A random ID is created for the room.
 *
 * @param room      the room to be persisted
 * @returns         the room with its new ID
 */
export function saveGameRoom(room: Room): Room {
    room.id = crypto.randomBytes(8).toString("hex");
    const namespace: Namespace = namespaceStore.findNamespaceByID(NAMESPACE_ID_GAMES);
    namespace.rooms.push(room);
    namespaceStore.saveNamespace(namespace);
    
    return JSON.parse(JSON.stringify(room));
}

/**
 * Add a user to room if the user is not already a member of the room. 
 */
export function addUserToRoom(userID: string, roomID: string, namespaceID: number): void {
    const namespace: Namespace = namespaceStore.findNamespaceByID(namespaceID);
    namespace.rooms.forEach((room: Room) => {
        if (room.id === roomID && !room.members.includes(userID)) {
            room.members.push(userID);
        }
    });
    namespaceStore.saveNamespace(namespace);
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
    const response = await RoomSchema.findOne({ name: roomName }, 'members');
    if (response && response.members) {
        const roomMembers: String[] = response.members;
        if (!roomMembers.includes(userID)) {
            roomMembers.push(userID);
            await RoomSchema.findOneAndUpdate({ name: roomName }, { members: roomMembers });
        }
    }
}

/**
 * Remove a user from room if the user is a member of the room. 
 */
export function removeUserFromRoom(userID: string, roomID: string, namespaceID: number): void {
    const namespace: Namespace = namespaceStore.findNamespaceByID(namespaceID);
    namespace.rooms.forEach((room: Room) => {
        if (room.id === roomID && room.members.includes(userID)) {
            const filteredMembers: string[] = room.members.filter((user: string) => user !== userID);
            room.members = [];
            room.members.push(...filteredMembers);
        }
    });
    namespaceStore.saveNamespace(namespace);
}

export function getRoomByID(roomID: string, namespaceID: number): Room {
    const namespace: Namespace = namespaceStore.findNamespaceByID(namespaceID);
    let matchingRoom: Room | undefined;
    namespace.rooms.forEach((room: Room) => {
        if (room.id === roomID) {
            matchingRoom = room;
        }
    });

    return JSON.parse(JSON.stringify(matchingRoom));
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