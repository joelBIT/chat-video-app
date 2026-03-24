import type { Namespace, Room, ChatUser } from "../../types";
import namespaceStore from "../stores/NamespaceStore";
import userStore from "../stores/UserStore";

export function getUsersInRoom(roomID: string, namespaceID: number): ChatUser[] {
    const memberList: ChatUser[] = [];
    const matchingRoom: Room | undefined = namespaceStore.getNamespace(namespaceID).rooms.find((room: Room) => room.id === roomID);
    if (matchingRoom) {
        matchingRoom.members.forEach((memberID: string) => {
            memberList.push(userStore.getUserById(memberID));
        });
    }
    
    return memberList;
}

export function getUsersInSelectedRoom(): ChatUser[] {
    const memberList: ChatUser[] = [];
    const matchingRoom: Room | undefined = namespaceStore.getSelectedNamespace()?.rooms.find((room: Room) => room.id === namespaceStore.getSelectedRoomId());
    if (matchingRoom) {
        matchingRoom.members.forEach((memberID: string) => {
            memberList.push(userStore.getUserById(memberID));
        });
    }
    
    return memberList;
}

export function addUserToRoom(roomID: string, userID: string, namespaceID: number): void {
    const namespace: Namespace = namespaceStore.getNamespace(namespaceID);
    const matchingRoom: Room | undefined = namespace.rooms.find((room: Room) => room.id === roomID);
    if (matchingRoom && !matchingRoom.members.includes(userID)) {
        matchingRoom.members.push(userID);
        const rooms: Room[] = namespace.rooms.filter((room: Room) => room.id !== roomID);
        rooms.push(matchingRoom);
        namespace.rooms = [];
        namespace.rooms.push(...rooms);
        namespaceStore.saveNamespace(namespace);
    }
}

export function removeUserFromRoom(roomID: string, userID: string, namespaceID: number): void {
    const namespace: Namespace = namespaceStore.getNamespace(namespaceID);
    const matchingRoom: Room | undefined = namespace.rooms.find((room: Room) => room.id === roomID);
    if (matchingRoom && matchingRoom.members.includes(userID)) {
        const filteredMembers: string[] = matchingRoom.members.filter((memberID: string) => memberID !== userID);
        matchingRoom.members = [];
        matchingRoom.members.push(...filteredMembers);
        const filteredRooms: Room[] = namespace.rooms.filter((room: Room) => room.id !== roomID);
        filteredRooms.push(matchingRoom);
        namespace.rooms = [];
        namespace.rooms.push(...filteredRooms);
        namespaceStore.saveNamespace(namespace);
    }
}

export function addAllUsers(users: ChatUser[]): void {
    userStore.addAllUsers(users);
}

export function saveUser(user: ChatUser): void {
    userStore.saveUser(user);
}

export function getSignedOutUser(): ChatUser {
    return userStore.getSignedOutUser();
}