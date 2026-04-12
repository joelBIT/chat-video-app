import type { Message } from "../../types";
import { getConversationMessages } from "../dao/messageDAO";

/**
 * Retrieve messages that have been made in a private conversation between two users.
 * The order of user1 and user2 are not important. All messages where these two users are
 * sender and receiver (in any order) will be retrieved.
 */
export async function getPrivateConversation(user1ID: string, user2ID: string): Promise<Message[]> {
    const conversations: Message[] = [];

    try {
        const conversations1: Message[] = await getConversationMessages(user1ID, user2ID);
        const conversations2: Message[] = await getConversationMessages(user2ID, user1ID);
        conversations.push(...conversations1);
        conversations.push(...conversations2);
    } catch (error) {
        console.log(error);
    }

    return conversations;
}