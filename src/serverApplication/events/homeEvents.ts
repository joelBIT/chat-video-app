import { Server } from "socket.io";
import type { Message } from "../../types";
import { saveMessage } from "../services/messageService";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, NAMESPACE_HOME_ENDPOINT, NAMESPACE_ID_HOME, ROOM_NAME_ANNOUNCEMENTS, ROOM_NAME_GENERAL, ROOM_NAME_SUPPORT, USER_JOINED } from "../utils";
import Namespace from "../schemas/namespaceSchema";
import Room from "../schemas/roomSchema";

/**
 * Initialize events that are specific to the "Home" namespace.
 */
export async function initializeHomeEvents(io: Server): Promise<void> {
    await createDatabaseCollections();
    
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

/**
 * Create the "Home" namespace and the common rooms if the namespace does not exist.
 */
async function createDatabaseCollections(): Promise<void> {
    const exists = await Namespace.exists({ name: 'Home' });
    if (!exists) {
        const homeNamespace = new Namespace({
            _id: NAMESPACE_ID_HOME,
            name: 'Home',
            endpoint: NAMESPACE_HOME_ENDPOINT,
            image: 'home.svg'
        });
        
        await homeNamespace.save();
    }

    let roomExists = await Room.exists({ name: ROOM_NAME_GENERAL });
    if (!roomExists) {
        const generalRoom = new Room({
            name: ROOM_NAME_GENERAL,
            namespaceId: NAMESPACE_ID_HOME
        });

        await generalRoom.save();
    }

    roomExists = await Room.exists({ name: ROOM_NAME_SUPPORT });
    if (!roomExists) {
        const supportRoom = new Room({
            name: ROOM_NAME_SUPPORT,
            namespaceId: NAMESPACE_ID_HOME
        });

        await supportRoom.save();
    }

    roomExists = await Room.exists({ name: ROOM_NAME_ANNOUNCEMENTS });
    if (!roomExists) {
        const announcementsRoom = new Room({
            name: ROOM_NAME_ANNOUNCEMENTS,
            namespaceId: NAMESPACE_ID_HOME
        });

        await announcementsRoom.save();
    }
}