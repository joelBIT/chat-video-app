import { Server } from "socket.io";
import { getDataForUser } from "../services/namespaceService";
import type { ISocket } from "../interfaces";
import { NAMESPACES, USER_CONNECTED, USER_DISCONNECTED, USER_UPDATED } from "../utils/constants";
import type { ChatUser, Namespace } from "../../types";
import { findUserById, findUserByUsername, getAllUsers, updateOnlineStatus, updateUser } from "../dao/userDAO";
import { setAllUsersAsOffline } from "../utils/database";

/**
 * Initializes events for the main namespace ('/') only. The connected client receives data via the "namespaces" event. This data consists of
 * getDataForUser (all namespaces containing existing rooms, message history, and room members), getUserByID (the connected user itself), and
 * getAllUsers (all application users and their metadata).
 */
export async function initializeMainNamespaceEvents(io: Server): Promise<void> {
    await setAllUsersAsOffline();

    io.on("connection", async (socket: ISocket)  => {
        console.log(`connected ${socket.id}`);
        const userID: string | undefined = socket.userID as string;

        try {
            const user: ChatUser = await findUserById(userID);
            const users: ChatUser[] = await getAllUsers();
            const namespaces: Namespace[] = await getDataForUser(user.id);
            socket.emit(NAMESPACES, namespaces, user, users);                   // Send back data to the connected client
            io.except(socket.id).emit(USER_CONNECTED, user);                    // Inform other clients that the user is online
        } catch (error) {
            console.log(error);
        }

        socket.on(USER_UPDATED, async (updatedUser: ChatUser, ackCallback) => {
            try {
                const user: ChatUser = await findUserByUsername(updatedUser.username);

                if (user.id !== updatedUser.id) {
                    ackCallback({ message: 'Username is already taken', success: false });      // Updated user may have a new username that already exists
                } else {
                    updateUser(updatedUser);
                    io.except(socket.id).emit(USER_UPDATED, updatedUser);
                    ackCallback({ message: 'Profile updated', success: true });
                }
            } catch (error) {
                console.log(error);
            }
            
            ackCallback({ message: `User ${updatedUser.username} not found`, success: false });
        });

        socket.on("disconnect", async reason => {
            console.log(`disconnect ${userID} due to ${reason}`);
            
            if (userID) {
                try {
                    const user: ChatUser = await findUserById(userID);
                    await updateOnlineStatus(user.username, false);
                    user.online = false;
                    io.emit(USER_DISCONNECTED, user);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    });
}