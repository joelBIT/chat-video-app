import { Server } from "socket.io";
import { getAllNamespaces } from "../dao/namespaceDAO";
import { findUserByUsername } from "../dao/userDAO";
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
            const username = socket.handshake.query.username;
            console.log(`connected username ${username}`);

            if (typeof username === "string") {
                try {
                    const user = await findUserByUsername(username);
                    namespace.rooms.forEach((room: Room) => {
                        if (isCommonRoom(room.name) || room.members.includes(user.id)) {      // Join rooms where the user is a member
                            socket.join(room.id);

                            // inform clients about the connected user
                            io.of(namespace.endpoint).to(room.id).emit(USER_JOINED, room.id, user.id, room.namespaceId);
                        }
                    });
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log(`Could not inform clients about connecting ${username}`);
            }
        });
    });
}