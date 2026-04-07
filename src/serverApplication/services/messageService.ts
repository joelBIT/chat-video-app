import type { Message } from "../../types";
import { MessageModel } from "../schemas/messageSchema";

/**
 * Save message in database.
 */
export async function saveMessage(message: Message): Promise<void> {
    const newMessage = new MessageModel({
        from: message.from,
        to: message.to,
        public: message.public,
        text: message.text,
        date: message.date
    });
        
    await newMessage.save();
}

/**
 * Retrieve messages that have been made in a private conversation between two users.
 * The order of user1 and user2 are not important. All messages where these two users are
 * sender and receiver (in any order) will be retrieved.
 */
export async function getPrivateConversation(user1ID: string, user2ID: string): Promise<Message[]> {
    const conversations1: Message[] = await MessageModel.find({ "from": user1ID, "to": user2ID, "public": false });
    const conversations2: Message[] = await MessageModel.find({ "from": user2ID, "to": user1ID, "public": false });
    return [...conversations1, ...conversations2];
}

export async function getConversationsByUserID(userID: string): Promise<string[]> {
    return await MessageModel.find({ "from": userID, "public": false }).distinct("to");
}

/**
 * Create a conversation for the recipient with the sender (if none exist), but do not send it to the recipient yet until the first message is sent.
 * This is because the recipient should not get an empty room visible as soon as the senderID initiates a conversations.
 * The conversation is saved separately for both the sender and the recipient for fast lookup of conversations for each client when desired.
 * 
 * @param senderID              is the client that initiates the conversation
 * @param recipientID           is the client that senderID wish to start a conversation with
 */
// export function saveConversationForUser(senderID: string, recipientID: string): void {
//     const senderConversations: string[] = messageStore.findConversations(senderID);
//     if (!senderConversations.includes(recipientID)) {
//         senderConversations.push(recipientID);
//         messageStore.saveConversations(senderID, senderConversations);           // TODO: Remove this code?
//     }
// }