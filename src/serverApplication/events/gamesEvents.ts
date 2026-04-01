import { Server } from "socket.io";
import { addUserToRoom, getRoomByID, isMember, removeUserFromRoom, saveGameRoom } from "../services/roomService";
import { saveMessage } from "../services/messageService";
import type { Message, Room } from "../../types";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, CREATE_ROOM, isCommonRoom, LEAVE_ROOM, NAMESPACE_ID_GAMES, UPDATE_CUSTOM_GAME_ROOM, UPDATE_ROOMS, USER_JOINED, USER_LEFT } from "../utils";
import RoomSchema from "../schemas/roomSchema";
import Namespace from "../schemas/namespaceSchema";

/**
 * Initialize events that are specific to the "Games" namespace (id 2).
 */
export async function initializeGamesEvents(io: Server): Promise<void> {
    const lobbyRoom = new RoomSchema({
        name: 'Lobby',
        namespaceId: NAMESPACE_ID_GAMES
    });

    await lobbyRoom.save();
    
    const gamesNamespace = new Namespace({
        _id: NAMESPACE_ID_GAMES,
        name: 'Games',
        endpoint: '/games',
        image: 'games.svg'
    });
    
    await gamesNamespace.save();

    io.of(gamesNamespace.endpoint).on("connection", async (socket: ISocket) => {
        socket.on(CREATE_ROOM, (room: Room, userID: string) => {
            room.members = [];
            room.members.push(userID);
            const persistedRoom: Room = saveGameRoom(room);
            socket.join(persistedRoom.id);
            
            // Send created room to clients so that the room appears in the room list in "Games".
            io.of(gamesNamespace.endpoint).emit(UPDATE_ROOMS, persistedRoom);
        });

        socket.on(CHAT_MESSAGE, (message: Message) => {
            if ([...socket.rooms].find((roomID: string) => roomID === message.to.id)) {     // Check if socket is member of room
                saveMessage(message);
                io.of(gamesNamespace.endpoint).to(message.to.id).emit(CHAT_MESSAGE, message);
            }
        });

        socket.on(CHANGE_ROOM, async (roomID: string, userID: string) => {
            socket.join(roomID);

            if (!isCommonRoom(roomID) && !isMember(userID, roomID, NAMESPACE_ID_GAMES)) {
                // If changing to a custom game room that the client is not a member of, send back the room containing its message history.
                const room = getRoomByID(roomID, NAMESPACE_ID_GAMES);
                io.of(gamesNamespace.endpoint).to(socket.id).emit(UPDATE_CUSTOM_GAME_ROOM, room);
            }

            addUserToRoom(userID, roomID, NAMESPACE_ID_GAMES);
            io.of(gamesNamespace.endpoint).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_GAMES);
        });

        socket.on(LEAVE_ROOM, (roomID: string, userID: string) => {
            socket.leave(roomID);
            removeUserFromRoom(userID, roomID, NAMESPACE_ID_GAMES);

            io.of(gamesNamespace.endpoint).emit(USER_LEFT, roomID, userID, NAMESPACE_ID_GAMES);
        });
    });
}