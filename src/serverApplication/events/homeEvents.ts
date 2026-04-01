import { Server } from "socket.io";
import type { Message } from "../../types";
import { saveMessage } from "../services/messageService";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, NAMESPACE_ID_HOME, USER_JOINED } from "../utils";
import Namespace from "../schemas/namespaceSchema";
import Room from "../schemas/roomSchema";

/**
 * Initialize events that are specific to the "Home" namespace.
 */
export async function initializeHomeEvents(io: Server): Promise<void> {
    const generalRoom = new Room({
        name: 'General',
        namespaceId: NAMESPACE_ID_HOME
    });

    await generalRoom.save();
    
    const supportRoom = new Room({
        name: 'Support',
        namespaceId: NAMESPACE_ID_HOME
    });

    await supportRoom.save();
    
    const announcementsRoom = new Room({
        name: 'Announcements',
        namespaceId: NAMESPACE_ID_HOME
    });

    await announcementsRoom.save();
    
    const homeNamespace = new Namespace({
        _id: NAMESPACE_ID_HOME,
        name: 'Home',
        endpoint: '/home',
        image: 'home.svg'
    });
    
    await homeNamespace.save();
    
    io.of(homeNamespace.endpoint).on("connection", async (socket: ISocket) => {
        socket.on(CHANGE_ROOM, async (roomID: string, userID: string) => {
            socket.join(roomID);
            
            io.of(homeNamespace.endpoint).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_HOME); // inform clients about the connected user
        });

        socket.on(CHAT_MESSAGE, (message: Message) => {
            if ([...socket.rooms].find((roomID: string) => roomID === message.to.id)) {     // Check if socket is member of room
                saveMessage(message);
                io.of(homeNamespace.endpoint).to(message.to.id).emit(CHAT_MESSAGE, message);
            }
        });
    });
}