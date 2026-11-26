import { Server } from "socket.io";
import { getPrivateConversation } from "../services/messageService";
import type { Message, Room, ChatUser } from "../../types";
import type { ISocket } from "../interfaces";
import { CREATE_ROOM, NAMESPACE_DM_ENDPOINT, NAMESPACE_ID_DM, PRIVATE_MESSAGE, UPDATE_ROOMS } from "../utils/constants";
import { saveMessage } from "../dao/messageDAO";
import { buildMessage } from "../utils/messages";
import { findUserById } from "../dao/userDAO";
import { safeOn } from "../utils/safeSocket";

/**
 * Initialize events that are specific to the "DMs" namespace (id 1).
 * Private conversations are always in namespace 1 (DMs). Private conversations includes two (and only two) users in a private chat.
 */
export async function initializeDmEvents(io: Server): Promise<void> {

  io.of(NAMESPACE_DM_ENDPOINT).on("connection", (socket: ISocket) => {
        const userID = socket.userID;
        if (!userID) {
            socket.disconnect(true);
            return;
        }

        socket.join(userID);            // Personal room

        safeOn(socket, CREATE_ROOM, async (recipientID: unknown, ackCallback: unknown) => {
            if (typeof recipientID !== "string" || typeof ackCallback !== "function") {
                return;
            }

            try {
                const sender: ChatUser = await findUserById(userID);
                const recipient: ChatUser = await findUserById(recipientID);
                if (sender.id === recipient.id) {
                    return ackCallback({ room: null });
                }

                const messages: Message[] = await getPrivateConversation(sender.id, recipient.id);
                const members = [sender.id, recipient.id];

                const remoteRoom: Room = { id: sender.id, name: sender.username, namespaceId: NAMESPACE_ID_DM, private: true, members, history: [...messages] };
                io.of(NAMESPACE_DM_ENDPOINT).to(recipient.id).emit(UPDATE_ROOMS, remoteRoom);

                const room: Room = { id: recipient.id, name: recipient.username, namespaceId: NAMESPACE_ID_DM, private: true, members, history: [...messages] };
                ackCallback({ room });
            } catch (error) {
                console.log(error);
                ackCallback({ room: null });
            }
        });

        safeOn(socket, PRIVATE_MESSAGE, async (message: unknown) => {
            const trusted = buildMessage(userID, message, false);
            if (!trusted || trusted.to === userID) {
                return;
            }

            try {
                await findUserById(trusted.to);         // The recipient must exist
                saveMessage(trusted);
                io.of(NAMESPACE_DM_ENDPOINT).to(trusted.to).to(trusted.from).emit(PRIVATE_MESSAGE, trusted);
            } catch (error) {
                console.log(error);
            }
        });
    });
}