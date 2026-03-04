import { Server } from "socket.io";
import { getNamespaceByID } from "../services/namespaceService";
import { addUserToRoom, getRoomByID, isMember, removeUserFromRoom, saveGameRoom } from "../services/roomService";
import { saveMessage } from "../services/messageService";
import type { Message, Namespace, Room } from "../../types";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, CREATE_ROOM, isCommonRoom, LEAVE_ROOM, NAMESPACE_ID_GAMES, UPDATE_CUSTOM_GAME_ROOM, UPDATE_ROOMS, USER_JOINED, USER_LEFT } from "../utils";

/**
 * Initialize events that are specific to the "Games" namespace (id 2).
 */
export async function initializeGamesEvents(io: Server): Promise<void> {
    const namespace: Namespace = getNamespaceByID(NAMESPACE_ID_GAMES);

    io.of(namespace.endpoint).on("connection", async (socket: ISocket) => {
        socket.on(CREATE_ROOM, (room: Room, userID: string) => {
            room.members = [];
            room.members.push(userID);
            const persistedRoom: Room = saveGameRoom(room);
            socket.join(persistedRoom.id);
            
            // Send created room to clients so that the room appears in the room list in "Games".
            io.of(namespace.endpoint).emit(UPDATE_ROOMS, persistedRoom);
        });

        socket.on(CHAT_MESSAGE, (message: Message) => {
            if ([...socket.rooms].find((roomID: string) => roomID === message.to.id)) {     // Check if socket is member of room
                saveMessage(message);
                io.of(namespace.endpoint).to(message.to.id).emit(CHAT_MESSAGE, message);
            }
        });

        socket.on(CHANGE_ROOM, async (roomID: string, userID: string) => {
            socket.join(roomID);

            if (!isCommonRoom(roomID) && !isMember(userID, roomID, NAMESPACE_ID_GAMES)) {
                // If changing to a custom game room that the client is not a member of, send back the room containing its message history.
                const room = getRoomByID(roomID, NAMESPACE_ID_GAMES);
                io.of(namespace.endpoint).to(socket.id).emit(UPDATE_CUSTOM_GAME_ROOM, room);
            }

            addUserToRoom(userID, roomID, NAMESPACE_ID_GAMES);
            io.of(namespace.endpoint).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_GAMES);
        });

        socket.on(LEAVE_ROOM, (roomID: string, userID: string) => {
            socket.leave(roomID);
            removeUserFromRoom(userID, roomID, NAMESPACE_ID_GAMES);

            io.of(namespace.endpoint).emit(USER_LEFT, roomID, userID, NAMESPACE_ID_GAMES);
        });
    });
}