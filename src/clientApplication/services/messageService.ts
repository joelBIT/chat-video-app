import { NAMESPACE_ID_DM } from "../../serverApplication/utils/constants";
import namespaceStore from "../stores/NamespaceStore";
import userStore from "../stores/UserStore";
import type { Message, Room } from "../../types";

/**
 * Public rooms have their own unique IDs and members always send messages to that room's ID. The namespace is the
 * one of the socket that received the message, not the namespace selected in the UI.
 */
export function saveMessage(message: Message, namespaceId: number): void {
    const room: Room | undefined = namespaceStore.getNamespace(namespaceId).rooms.find((room: Room) => room.id === message.to);
    room?.history.push(message);
}

/**
 * A private conversation is stored under the OTHER user's ID. If this is the first message from that user,
 * the conversation is created.
 */
export function saveConversationMessage(message: Message): void {
    const namespace = namespaceStore.getNamespace(NAMESPACE_ID_DM);
    const myUserID: string = userStore.getCurrentUserId();
    const otherUserID: string = message.from === myUserID ? message.to : message.from;

    let room: Room | undefined = namespace.rooms.find((room: Room) => room.id === otherUserID);
    if (!room) {
        room = {
            id: otherUserID,
            name: userStore.getUserById(otherUserID).username,
            namespaceId: NAMESPACE_ID_DM,
            private: true,
            members: [myUserID, otherUserID],
            history: []
        };
        namespace.rooms.push(room);
    }

    room.history.push(message);
}