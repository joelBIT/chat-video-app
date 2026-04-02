import messageStore from "../stores/MessageStore";
import type { Message } from "../../types";
import { NAMESPACE_ID_DM } from "../utils";
import PersonalMessage from "../schemas/personalMessageSchema";
import { PublicMessage } from "../schemas/publicMessageSchema";

/**
 * Messages in personal conversations (DM) are stored in PersonalMessages. The other messages are stored in PublicMessages.
 */
export async function saveMessage(message: Message): Promise<void> {
    if (message.to.namespaceId === NAMESPACE_ID_DM) {
        const newMessage = new PersonalMessage({
            from: message.from,
            to: message.to,
            text: message.text,
            date: message.date
        });
            
        await newMessage.save();
    } else {
        const newMessage = new PublicMessage({
            from: message.from,
            to: message.to,
            text: message.text,
            date: message.date
        });
            
        await newMessage.save();
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