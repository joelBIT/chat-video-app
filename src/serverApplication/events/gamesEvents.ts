import { Server } from "socket.io";
import { addUserToRoom, isCorrectPassword, isMember, removeUserFromRoom } from "../services/roomService";
import type { ActionState, Room } from "../../types";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, CREATE_ROOM, isCommonRoom, LEAVE_ROOM, NAMESPACE_GAMES_ENDPOINT, NAMESPACE_ID_GAMES, UPDATE_CUSTOM_GAME_ROOM, UPDATE_ROOMS, USER_JOINED, USER_LEFT } from "../utils/constants";
import { getRoomByID, saveRoom } from "../dao/roomDAO";
import { saveMessage } from "../dao/messageDAO";
import { buildMessage } from "../utils/messages";
import { isLockedOut, registerFailure } from "../utils/rateLimit";

/**
 * Initialize events that are specific to the "Games" namespace (id 2).
 */
export async function initializeGamesEvents(io: Server): Promise<void> {
    
    io.of(NAMESPACE_GAMES_ENDPOINT).on("connection", (socket: ISocket) => {
        const userID = socket.userID;
        if (!userID) {
            socket.disconnect(true);
            return;
        }

        socket.on(CREATE_ROOM, async (room: Room, password: unknown) => {
            if (typeof room?.name !== "string" || typeof room.private !== "boolean" || typeof password !== "string") {
                return;
            }
            if (room.private && password.length === 0) {
                return;
            }

            try {
                // The namespace is forced; the client cannot create rooms elsewhere.
                const persistedRoom: Room = await saveRoom({ ...room, namespaceId: NAMESPACE_ID_GAMES }, password);
                await addUserToRoom(userID, persistedRoom.name);        // The creator is the first member
                persistedRoom.members = [userID];

                socket.join(persistedRoom.id);
                io.of(NAMESPACE_GAMES_ENDPOINT).emit(UPDATE_ROOMS, persistedRoom);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(CHAT_MESSAGE, (message: unknown) => {
            const trusted = buildMessage(userID, message, true);
            if (!trusted || !socket.rooms.has(trusted.to)) {
                return;
            }

            saveMessage(trusted);
            io.of(NAMESPACE_GAMES_ENDPOINT).to(trusted.to).emit(CHAT_MESSAGE, trusted);
        });

        socket.on(CHANGE_ROOM, async (roomID: unknown, password: unknown, ackCallback: unknown) => {
            const reply = (response: ActionState): void => {
                if (typeof ackCallback === "function") {
                    ackCallback(response);
                }
            };

            if (typeof roomID !== "string") {
                return reply({ success: false, message: "Invalid room." });
            }

            try {
                const room: Room = await getRoomByID(roomID);
                if (room.namespaceId !== NAMESPACE_ID_GAMES) {
                    return reply({ success: false, message: "Invalid room." });
                }

                const isRoomMember: boolean = await isMember(userID, roomID);
                if (room.private && !isRoomMember) {
                    if (isLockedOut(userID)) {
                        return reply({ success: false, message: "Too many wrong passwords. Try again in a minute." });
                    }

                    if (typeof password !== "string" || !(await isCorrectPassword(room.name, password))) {
                        registerFailure(userID);
                        return reply({ success: false, message: `Wrong password for room ${room.name}` });
                    }
                }

                if (!isCommonRoom(room.name) && !isRoomMember) {
                    io.of(NAMESPACE_GAMES_ENDPOINT).to(socket.id).emit(UPDATE_CUSTOM_GAME_ROOM, room);
                }

                socket.join(roomID);
                await addUserToRoom(userID, room.name);
                io.of(NAMESPACE_GAMES_ENDPOINT).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_GAMES);
                reply({ success: true, message: "Joined room." });
            } catch (error) {
                console.log(error);
                reply({ success: false, message: "Could not join room." });
            }
        });

        socket.on(LEAVE_ROOM, async (roomID: unknown) => {
            if (typeof roomID !== "string") {
                return;
            }

            socket.leave(roomID);
            await removeUserFromRoom(userID, roomID);
            io.of(NAMESPACE_GAMES_ENDPOINT).emit(USER_LEFT, roomID, userID, NAMESPACE_ID_GAMES);
        });
    });
}