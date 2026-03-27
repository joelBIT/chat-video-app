import { Server } from "socket.io";
import { getDataForUser } from "../services/namespaceService";
import { getAllUsers, getUserByID, getUserByUsername, saveUser, setOnlineStatusForUser } from "../services/userService";
import type { ISocket } from "../interfaces";
import { NAMESPACES, USER_CONNECTED, USER_DISCONNECTED, USER_UPDATED } from "../utils";
import type { ChatUser } from "../../types";

/**
 * Initializes events for the main namespace ('/') only. The connected client receives data via the "namespaces" event. This data consists of
 * getDataForUser (all namespaces containing existing rooms, message history, and room members), getUserByID (the connected user itself), and
 * getAllUsers (all application users and their metadata).
 */
export function initializeMainNamespaceEvents(io: Server): void {
    io.on("connection", async (socket: ISocket)  => {
        console.log(`connected ${socket.id}`);

        const userID: string | undefined = socket.userID;
        if (userID) {
            socket.emit(NAMESPACES, getDataForUser(userID), getUserByID(userID), getAllUsers());          // Send back data to the connected client
            io.except(socket.id).emit(USER_CONNECTED, getUserByID(userID));                                // Inform other clients that the user is online
        }

        socket.on(USER_UPDATED, (updatedUser: ChatUser, ackCallback) => {
            const user = getUserByUsername(updatedUser.username);
            if (user && user.id !== updatedUser.id) {
                ackCallback({ message: 'Username is already taken', success: false });      // Updated user may have a new username that already exists
            } else {
                saveUser(updatedUser);
                io.except(socket.id).emit(USER_UPDATED, updatedUser);
                ackCallback({ message: 'Profile updated', success: true });
            }
        });

        socket.on("disconnect", async reason => {
            console.log(`disconnect ${userID} due to ${reason}`);
            
            if (userID) {
                setOnlineStatusForUser(userID, false);
                io.emit(USER_DISCONNECTED, getUserByID(userID));
            } else {
                console.log(`Could not inform clients about disconnecting ${userID}`);
            }
        });
    });
}