import { Server } from "socket.io";
import type { Message, Namespace } from "../../src/types";
import { getNamespaceByID } from "../services/namespaceService";
import { saveMessage } from "../services/messageService";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, NAMESPACE_ID_HOME, USER_JOINED } from "../utils";

/**
 * Initialize events that are specific to the "Home" namespace (id 0).
 */
export async function initializeHomeEvents(io: Server): Promise<void> {
    const namespace: Namespace = getNamespaceByID(NAMESPACE_ID_HOME);
    
    io.of(namespace.endpoint).on("connection", async (socket: ISocket) => {
        socket.on(CHANGE_ROOM, async (roomID: string, userID: string) => {
            socket.join(roomID);
            
            io.of(namespace.endpoint).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_HOME); // inform clients about the connected user
        });

        socket.on(CHAT_MESSAGE, (message: Message) => {
            if ([...socket.rooms].find((roomID: string) => roomID === message.to.id)) {     // Check if socket is member of room
                saveMessage(message);
                io.of(namespace.endpoint).to(message.to.id).emit(CHAT_MESSAGE, message);
            }
        });
    });
}