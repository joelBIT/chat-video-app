import { Server } from "socket.io";
import type { Message } from "../../types";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, NAMESPACE_HOME_ENDPOINT, NAMESPACE_ID_HOME, USER_JOINED } from "../utils/constants";
import { saveMessage } from "../dao/messageDAO";

/**
 * Initialize events that are specific to the "Home" namespace.
 */
export async function initializeHomeEvents(io: Server): Promise<void> {
    
    io.of(NAMESPACE_HOME_ENDPOINT).on("connection", async (socket: ISocket) => {
        socket.on(CHANGE_ROOM, async (roomID: string, userID: string) => {
            socket.join(roomID);
            
            io.of(NAMESPACE_HOME_ENDPOINT).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_HOME); // inform clients about the connected user
        });

        socket.on(CHAT_MESSAGE, (message: Message) => {
            if ([...socket.rooms].find((roomID: string) => roomID === message.to)) {     // Check if socket is member of room
                saveMessage(message);
                io.of(NAMESPACE_HOME_ENDPOINT).to(message.to).emit(CHAT_MESSAGE, message);
            }
        });
    });
}