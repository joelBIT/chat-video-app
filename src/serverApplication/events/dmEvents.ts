import { Server } from "socket.io";
import { getUserByUsername } from "../services/userService";
import { getPrivateConversation, hasConversationMessage, saveConversationForUser, saveMessage } from "../services/messageService";
import type { Message, Room, ChatUser } from "../../types";
import type { ISocket } from "../interfaces";
import { CREATE_ROOM, NAMESPACE_DM_ENDPOINT, NAMESPACE_ID_DM, PRIVATE_MESSAGE, UPDATE_ROOMS } from "../utils";
import Namespace from "../schemas/namespaceSchema";

/**
 * Initialize events that are specific to the "DMs" namespace (id 1).
 * Private conversations are always in namespace 1 (DMs). Private conversations includes two (and only two) users in a private chat.
 */
export async function initializeDmEvents(io: Server): Promise<void> {
    await createDatabaseCollection();

    io.of(NAMESPACE_DM_ENDPOINT).on("connection", async (socket: ISocket) => {
        joinPersonalRoom(socket);

        socket.on(CREATE_ROOM, (sender: ChatUser, recipient: ChatUser, ackCallback) => {
            saveConversationForUser(sender.id, recipient.id);

            const messages: Message[] = getPrivateConversation(sender.id, recipient.id);    // Get messages if conversation already exist
            const room: Room = {id: recipient.id, name: recipient.username, namespaceId: NAMESPACE_ID_DM, private: true, members: [sender.id, recipient.id], history: [...messages]};
        
            ackCallback({ room });      // Return the conversation (as a room) to the client.
        });

        /**
         * Check if this is the first message in a conversation between sender and recipient. In that case: send room to the recipient to inform
         * the recipient that a message has arrived.
         * If messages already exists, send the message to the recipient and return it to the sender.
         */
        socket.on(PRIVATE_MESSAGE, (message: Message) => {
            if (!hasConversationMessage(message.from.id, message.to.id)) {
                saveConversationForUser(message.to.id, message.from.id);
                // Send the room to the recipient if this is the first message ever sent in that conversation
                const room: Room = {id: message.from.id, name: message.from.username, namespaceId: NAMESPACE_ID_DM, private: true, members: [message.from.id, message.to.id], history: []};
                io.of(NAMESPACE_DM_ENDPOINT).to(message.to.id).emit(UPDATE_ROOMS, room);
            }

            saveMessage(message);
            
            const messageCopy: Message = JSON.parse(JSON.stringify(message));          // Create deep copy of the message
            io.of(NAMESPACE_DM_ENDPOINT).to(message.to.id).to(message.from.id).emit(PRIVATE_MESSAGE, messageCopy);
        });
    });
}

/**
 * Join personal DM room (used for private 1on1 conversations).
 */
async function joinPersonalRoom(socket: ISocket): Promise<void> {
    const username = socket.handshake.query.username;

    if (username && (typeof username === "string")) {
        const user: ChatUser | null = await getUserByUsername(username);
        if (user) {
            socket.join(user.id);
        }
    }
}

/**
 * Create the "DMs" namespace if it does not exist.
 */
async function createDatabaseCollection(): Promise<void> {
    const exists = await Namespace.findOne({ name: 'DMs' });
    if (!exists) {
        const dmNamespace = new Namespace({
            _id: NAMESPACE_ID_DM,
            name: 'DMs',
            endpoint: NAMESPACE_DM_ENDPOINT,
            image: 'dm.svg'
        });
            
        await dmNamespace.save();
    }
}