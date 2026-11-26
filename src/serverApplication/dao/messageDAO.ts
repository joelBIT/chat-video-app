import type { Message } from "../../types";
import { MessageModel } from "../schemas/messageSchema";
import { assertString } from "../utils/validate";

export async function saveMessage(message: Message): Promise<void> {
    try {
        await MessageModel.create(message);
    } catch (error) {
        console.log(error);
    }
}

export async function getMessagesByRoomId(roomID: string, limit: number = 50): Promise<Message[]> {
    assertString(roomID, "roomID");
    const messages = await MessageModel.find({ to: roomID }).sort({ date: -1 }).limit(limit);

    return messages.reverse().map((message): Message => ({
        from: message.from,
        to: message.to,
        public: message.public,
        text: message.text,
        date: message.date
    }));
}

/**
 * Return all messages from 'fromUserID' to 'toUserID'. These are messages from a private conversation between users 'fromUserID' and 'toUserID'.
 */
export async function getConversationMessages(fromUserID: string, toUserID: string) : Promise<Message[]> {
    assertString(fromUserID, "fromUserID");
    assertString(toUserID, "toUserID");
    return await MessageModel.find({ "from": fromUserID, "to": toUserID, "public": false });
}

/**
 * Returns a list of usernames of those users that userID has had a conversation with (sent messages to).
 */
export async function getConversationsByUserID(userID: string): Promise<string[]> {
    assertString(userID, "userID");
    return await MessageModel.find({ "from": userID, "public": false }).distinct("to");
}