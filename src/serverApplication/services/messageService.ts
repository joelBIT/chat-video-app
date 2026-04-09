import type { Message } from "../../types";
import { MessageModel } from "../schemas/messageSchema";

/**
 * Save message in database.
 */
export async function saveMessage(message: Message): Promise<void> {
    try {
        await MessageModel.create({
            from: message.from,
            to: message.to,
            public: message.public,
            text: message.text,
            date: message.date
        });
    } catch (error) {
        console.log(error);
    }
}

export async function getMessagesByRoomId(roomID: string): Promise<Message[]> {
    const messages: Message[] = [];

    try {
        const response = await MessageModel.find({ "to": roomID }).limit(50);
        messages.push(...response);
    } catch (error) {
        console.log(error);
    }

    return messages;
}

/**
 * Retrieve messages that have been made in a private conversation between two users.
 * The order of user1 and user2 are not important. All messages where these two users are
 * sender and receiver (in any order) will be retrieved.
 */
export async function getPrivateConversation(user1ID: string, user2ID: string): Promise<Message[]> {
    const conversations: Message[] = [];

    try {
        const conversations1: Message[] = await MessageModel.find({ "from": user1ID, "to": user2ID, "public": false });
        const conversations2: Message[] = await MessageModel.find({ "from": user2ID, "to": user1ID, "public": false });
        conversations.push(...conversations1);
        conversations.push(...conversations2);
    } catch (error) {
        console.log(error);
    }

    return conversations;
}

export async function getConversationsByUserID(userID: string): Promise<string[]> {
    try {
        return await MessageModel.find({ "from": userID, "public": false }).distinct("to");
    } catch (error) {
        console.log(error);
    }

    return [];
}