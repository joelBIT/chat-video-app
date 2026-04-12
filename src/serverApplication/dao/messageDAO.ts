import type { Message } from "../../types";
import { MessageModel } from "../schemas/messageSchema";

export async function saveMessage(message: Message): Promise<void> {
    try {
        await MessageModel.create(message);
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
 * Return all messages from 'fromUserID' to 'toUserID'. These are messages from a private conversation between users 'fromUserID' and 'toUserID'.
 */
export async function getConversationMessages(fromUserID: string, toUserID: string) : Promise<Message[]> {
    return await MessageModel.find({ "from": fromUserID, "to": toUserID, "public": false });
}

/**
 * Returns a list of usernames of those users that userID has had a conversation with (sent messages to).
 */
export async function getConversationsByUserID(userID: string): Promise<string[]> {
    try {
        return await MessageModel.find({ "from": userID, "public": false }).distinct("to");
    } catch (error) {
        console.log(error);
    }

    return [];
}