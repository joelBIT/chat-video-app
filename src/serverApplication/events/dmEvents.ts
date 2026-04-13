import { Server } from "socket.io";
import { getPrivateConversation } from "../services/messageService";
import type { Message, Room, ChatUser } from "../../types";
import type { ISocket } from "../interfaces";
import { CREATE_ROOM, NAMESPACE_DM_ENDPOINT, NAMESPACE_ID_DM, PRIVATE_MESSAGE, UPDATE_ROOMS } from "../utils/constants";
import { findUserByUsername } from "../dao/userDAO";
import { saveMessage } from "../dao/messageDAO";

/**
 * Initialize events that are specific to the "DMs" namespace (id 1).
 * Private conversations are always in namespace 1 (DMs). Private conversations includes two (and only two) users in a private chat.
 */
export async function initializeDmEvents(io: Server): Promise<void> {

    io.of(NAMESPACE_DM_ENDPOINT).on("connection", async (socket: ISocket) => {
        joinPersonalRoom(socket);

        socket.on(CREATE_ROOM, async (sender: ChatUser, recipient: ChatUser, ackCallback) => {
            const messages: Message[] = await getPrivateConversation(sender.id, recipient.id);    // Get messages if conversation already exist
            const remoteRoom: Room = {id: sender.id, name: sender.username, namespaceId: NAMESPACE_ID_DM, private: true, members: [sender.id, recipient.id], history: [...messages]};
            io.of(NAMESPACE_DM_ENDPOINT).to(recipient.id).emit(UPDATE_ROOMS, remoteRoom);

            const room: Room = {id: recipient.id, name: recipient.username, namespaceId: NAMESPACE_ID_DM, private: true, members: [sender.id, recipient.id], history: [...messages]};
            ackCallback({ room });      // Return the conversation (as a room) to the client.
        });

        /**
         * Check if this is the first message in a conversation between sender and recipient. In that case: send room to the recipient to inform
         * the recipient that a message has arrived.
         * If messages already exists, send the message to the recipient and return it to the sender.
         */
        socket.on(PRIVATE_MESSAGE, (message: Message) => {
            saveMessage(message);
            
            const messageCopy: Message = JSON.parse(JSON.stringify(message));          // Create deep copy of the message
            io.of(NAMESPACE_DM_ENDPOINT).to(message.to).to(message.from).emit(PRIVATE_MESSAGE, messageCopy);
        });
    });
}

/**
 * Join personal DM room (used for private 1on1 conversations).
 */
async function joinPersonalRoom(socket: ISocket): Promise<void> {
    const username = socket.handshake.query.username;

    if (username && (typeof username === "string")) {
        try {
            const user: ChatUser = await findUserByUsername(username);
            socket.join(user.id);
        } catch (error) {
            console.log(error);
        }
    }
}