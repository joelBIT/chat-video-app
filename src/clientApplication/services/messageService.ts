import { NAMESPACE_ID_DM } from "../../serverApplication/utils/constants";
import namespaceStore from "../stores/NamespaceStore";
import type { Message, Namespace, Room } from "../../types";

/**
 * Public rooms have their own unique IDs and members of a room always send messages to that
 * room's ID so that is why only "message.to.id" is used to find the room. 
 */
export function saveMessage(message: Message): void {
    const namespaceId: number = namespaceStore.getSelectedNamespaceId();
    const namespace: Namespace = namespaceStore.getNamespace(namespaceId);
    namespace.rooms.forEach((room: Room) => {
        if (room.id === message.to) {
            room.history.push(message);
        }
    });
    namespaceStore.saveNamespace(namespace);
}

/**
 * Private conversation rooms between two clients are never stored with the clients own ID. 
 * The other part of the conversation's ID is always used as room ID. That is why
 * both "message.from.id" and "message.to.id" is checked when trying to find the private room.
 */
export function saveConversationMessage(message: Message): void {
    const namespace: Namespace = namespaceStore.getNamespace(NAMESPACE_ID_DM);
    namespace.rooms.forEach((room: Room) => {
        if (room.id === message.from || room.id === message.to) {
            room.history.push(message);
        }
    });
    namespaceStore.saveNamespace(namespace);
}