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

    return messages.reverse().map(toMessage);
}

function toMessage(message: any): Message {
    return { from: message.from, to: message.to, public: message.public, text: message.text, date: message.date };
}

/**
 * IDs of all users that userID has exchanged private messages with, in either direction.
 */
export async function getConversationsByUserID(userID: string): Promise<string[]> {
    const [sentTo, receivedFrom] = await Promise.all([
        MessageModel.find({ from: userID, public: false }).distinct("to"),
        MessageModel.find({ to: userID, public: false }).distinct("from")
    ]);

    return [...new Set<string>([...sentTo, ...receivedFrom])].filter((id: string) => id !== userID);
}

/**
 * The newest `limit` private messages between two users (either direction), oldest first.
 */
export async function getConversationMessages(userA: string, userB: string, limit: number = 100): Promise<Message[]> {
    const messages = await MessageModel.find({
        public: false,
        $or: [{ from: userA, to: userB }, { from: userB, to: userA }]
    }).sort({ date: -1 }).limit(limit);

    return messages.reverse().map(toMessage);
}