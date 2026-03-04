import crypto from "node:crypto";
import type { Namespace, Room } from "../../types";
import namespaceStore from "../stores/namespaceStore";
import { NAMESPACE_ID_GAMES } from "../utils";

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
export function isMember(userID: string, roomID: string, namespaceID: number): boolean {
    let isMember: boolean = false;
    const namespace: Namespace = namespaceStore.findNamespaceByID(namespaceID);
    namespace.rooms.forEach((room: Room) => {
        if (room.id === roomID && room.members.includes(userID)) {
            isMember = true;
        }
    });

    return isMember;
}