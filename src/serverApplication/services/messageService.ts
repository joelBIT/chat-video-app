import type { Message } from "../../types";
import { getConversationMessages } from "../dao/messageDAO";

/**
 * Retrieve messages that have been made in a private conversation between two users.
 * The order of user1 and user2 are not important. All messages where these two users are
 * sender and receiver (in any order) will be retrieved.
 */
export async function getPrivateConversation(user1ID: string, user2ID: string): Promise<Message[]> {
    try {
        return await getConversationMessages(user1ID, user2ID);
    } catch (error) {
        console.log(error);
        return [];
    }
}