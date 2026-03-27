import messageStore from "../stores/MessageStore";
import namespaceStore from "../stores/NamespaceStore";
import type { Message, Namespace, Room } from "../../types";
import { NAMESPACE_ID_DM } from "../utils";

/**
 * Messages in personal conversations (DM) are stored in messageStore. The other messages are stored in respective room.
 */
export function saveMessage(message: Message): void {
    if (message.to.namespaceId === NAMESPACE_ID_DM) {
        messageStore.saveMessage(message);
    } else {
        const namespace: Namespace = namespaceStore.findNamespaceByID(message.to.namespaceId);
        namespace.rooms.forEach((room: Room) => {
            if (room.id === message.to.id) {
                room.history.push(message);
            }
        });
        
        namespaceStore.saveNamespace(namespace);
    }
}

/**
 * Retrieve messages that have been made in a private conversation between two users.
 * The order of user1 and user2 are not important. All messages where these two users are
 * sender and receiver (in any order) will be retrieved.
 */
export function getPrivateConversation(user1ID: string, user2ID: string): Message[] {
    return messageStore.findConversationMessages(user1ID, user2ID);
}

export function getConversationsByUserID(userID: string): string[] {
    return messageStore.findConversations(userID);
}

/**
 * Create a conversation for the recipient with the sender (if none exist), but do not send it to the recipient yet until the first message is sent.
 * This is because the recipient should not get an empty room visible as soon as the senderID initiates a conversations.
 * The conversation is saved separately for both the sender and the recipient for fast lookup of conversations for each client when desired.
 * 
 * @param senderID              is the client that initiates the conversation
 * @param recipientID           is the client that senderID wish to start a conversation with
 */
export function saveConversationForUser(senderID: string, recipientID: string): void {
    const senderConversations: string[] = messageStore.findConversations(senderID);
    if (!senderConversations.includes(recipientID)) {
        senderConversations.push(recipientID);
        messageStore.saveConversations(senderID, senderConversations);
    }
}

export function hasConversationMessage(user1ID: string, user2ID: string): boolean {
    return messageStore.hasConversationMessage(user1ID, user2ID);
}