import { Server } from "socket.io";
import { getAllNamespaces } from "../dao/namespaceDAO";
import { findUserById } from "../dao/userDAO";
import type { Namespace, Room } from "../../types";
import type { ISocket } from "../interfaces";
import { isCommonRoom, USER_JOINED } from "../utils/constants";
import { createDatabaseCollections } from "../utils/database";

/**
 * Initializes common events for the namespaces (not the main namespace '/'). These custom namespaces are "Home", "DMs", and "Games".
 * Common rooms that all clients are members of are "General", "Support", "Lobby", and "Announcements".
 */
export async function initializeCommonEvents(io: Server): Promise<void> {
    await createDatabaseCollections();
    
    (await getAllNamespaces()).forEach((namespace: Namespace) => {
        io.of(namespace.endpoint).on("connection", async (socket: ISocket) => {
            const userID = socket.userID;
            if (!userID) {
                socket.disconnect(true);
                return;
            }

            try {
                const user = await findUserById(userID);
                console.log(`connected username ${user.username}`);

                namespace.rooms.forEach((room: Room) => {
                    if (isCommonRoom(room.name) || room.members.includes(user.id)) {
                        socket.join(room.id);
                        io.of(namespace.endpoint).to(room.id).emit(USER_JOINED, room.id, user.id, room.namespaceId);
                    }
                });
            } catch (error) {
                console.log(error);
            }
        });
    });
}