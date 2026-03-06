import { NAMESPACE_ID_GAMES, ROOM_ID_NONE } from "../../../socketApplication/utils";
import namespaceStore from "../stores/namespaceStore";
import type { Namespace, Room } from "../../types";

/**
 * A room may be "undefined" if the user is not active in a specific room at any given point in time.
 */
export function getSelectedRoom(): Room | undefined {
    let selectedRoom: Room | undefined = undefined;
    const selectedNamespace: Namespace | undefined = namespaceStore.getSelectedNamespace();
    if (selectedNamespace) {
        selectedNamespace.rooms.forEach((room: Room) => {
            if (room.id === namespaceStore.selectedRoomId) {
                selectedRoom = room;
            }
        })
    }

    return selectedRoom;
}

/**
 * Save room in its namespace if room does not already exist.
 */
export function saveRoom(newRoom: Room): void {
    const namespace: Namespace = namespaceStore.getNamespace(newRoom.namespaceId);
    if (namespace && !namespace.rooms.find((room: Room) => room.id === newRoom.id)) {
        const existingRooms: Room[] = namespace.rooms;
        existingRooms.push(newRoom);
        namespace.rooms = [];
        namespace.rooms.push(...existingRooms);
        namespaceStore.saveNamespace(namespace);
    }
}

/**
 * Check if userID is member of room with supplied roomID. This is only necessary to check in the "Games" namespace since users can create
 * their own rooms in that namespace.
 */
export function isMember(userID: string, roomID: string): boolean {
    const namespace: Namespace = namespaceStore.getNamespace(NAMESPACE_ID_GAMES);
    if (namespace) {
        const matchingRoom: Room | undefined = namespace.rooms.find((room: Room) => room.id === roomID);
        if (matchingRoom && matchingRoom.members.includes(userID)) {
            return true;
        }
    }
    return false;
}

export function getRoom(roomID: string, namespaceID: number): Room {
    const matchingRoom: Room | undefined = namespaceStore.getNamespace(namespaceID).rooms.find((room: Room) => room.id === roomID);
    if (matchingRoom) {
        return matchingRoom;
    }
    throw new Error(`Could not find room with id ${roomID}`);
}

export function getSelectedNamespaceRooms(): Room[] {
    return namespaceStore.getSelectedNamespace()?.rooms ?? [];
}

/**
 * Removes a room for the user when the user leaves the room.
 */
export function removeRoom(roomID: string, namespaceID: number): void {
    const namespace: Namespace = namespaceStore.getNamespace(namespaceID);
    if (namespace && namespace.rooms.find((room: Room) => room.id === roomID)) {
        const remainingRooms: Room[] = namespace.rooms.filter((room: Room) => room.id !== roomID);
        namespace.rooms = [];
        namespace.rooms.push(...remainingRooms);
        namespaceStore.saveNamespace(namespace);
    }
}

export function isSelectedRoom(roomID: string): boolean {
    return roomID === namespaceStore.selectedRoomId;
}

export function setSelectedRoomId(roomID: string): void {
    namespaceStore.selectedRoomId = roomID;
}

export function clearSelectedRoom(): void {
    namespaceStore.selectedRoomId = ROOM_ID_NONE;
}

/**
 * @returns     a list (sorted by ID) of game rooms that the client is not a member of.
 */
export function nonMemberGameRooms(userID: string): Room[] {
    const nonMemberRooms: Room[] = [];
    const AllGameRooms: Room[] | undefined = namespaceStore.getNamespace(NAMESPACE_ID_GAMES).rooms;
    AllGameRooms?.forEach((room: Room) => {
        if (!room.members.includes(userID)) {
            nonMemberRooms.push(room);
        }
    });

    return nonMemberRooms.sort((a: Room, b: Room) => a.id.localeCompare(b.id));
}

/**
 * @returns     a list (sorted by ID) of game rooms that the client is a member of.
 */
export function memberGameRooms(userID: string): Room[] {
    const memberRooms: Room[] = [];
    const AllGameRooms: Room[] | undefined = namespaceStore.getNamespace(NAMESPACE_ID_GAMES).rooms;
    AllGameRooms?.forEach((room: Room) => {
        if (room.members.includes(userID)) {
            memberRooms.push(room);
        }
    });

    return memberRooms.sort((a: Room, b: Room) => a.id.localeCompare(b.id));
}