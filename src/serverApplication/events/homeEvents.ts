import { Server } from "socket.io";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, NAMESPACE_HOME_ENDPOINT, NAMESPACE_ID_HOME, USER_JOINED } from "../utils/constants";
import { saveMessage } from "../dao/messageDAO";
import { getRoomByID } from "../dao/roomDAO";
import { buildMessage } from "../utils/messages";

/**
 * Initialize events that are specific to the "Home" namespace.
 */
export async function initializeHomeEvents(io: Server): Promise<void> {
    
    io.of(NAMESPACE_HOME_ENDPOINT).on("connection", (socket: ISocket) => {
        const userID = socket.userID;
        if (!userID) {
            socket.disconnect(true);
            return;
        }

        socket.on(CHANGE_ROOM, async (roomID: unknown) => {
            if (typeof roomID !== "string") {
                return;
            }

            try {
                const room = await getRoomByID(roomID);
                if (room.namespaceId !== NAMESPACE_ID_HOME) {
                    return;
                }

                socket.join(roomID);
                io.of(NAMESPACE_HOME_ENDPOINT).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_HOME);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(CHAT_MESSAGE, (message: unknown) => {
            const trusted = buildMessage(userID, message, true);
            if (!trusted || !socket.rooms.has(trusted.to)) {        // Must be in the room it writes to
                return;
            }

            saveMessage(trusted);
            io.of(NAMESPACE_HOME_ENDPOINT).to(trusted.to).emit(CHAT_MESSAGE, trusted);
        });
    });
}