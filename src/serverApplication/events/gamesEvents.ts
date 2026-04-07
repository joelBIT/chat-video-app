import { Server } from "socket.io";
import { addUserToRoom, getRoomByID, isMember, removeUserFromRoom, saveGameRoom } from "../services/roomService";
import { saveMessage } from "../services/messageService";
import type { Message, Room } from "../../types";
import type { ISocket } from "../interfaces";
import { CHANGE_ROOM, CHAT_MESSAGE, CREATE_ROOM, isCommonRoom, LEAVE_ROOM, NAMESPACE_GAMES_ENDPOINT, NAMESPACE_ID_GAMES, ROOM_NAME_LOBBY, UPDATE_CUSTOM_GAME_ROOM, UPDATE_ROOMS, USER_JOINED, USER_LEFT } from "../utils";
import RoomSchema from "../schemas/roomSchema";
import Namespace from "../schemas/namespaceSchema";

/**
 * Initialize events that are specific to the "Games" namespace (id 2).
 */
export async function initializeGamesEvents(io: Server): Promise<void> {
    await createDatabaseCollections();

    io.of(NAMESPACE_GAMES_ENDPOINT).on("connection", async (socket: ISocket) => {
        socket.on(CREATE_ROOM, async (room: Room, userID: string) => {
            room.members = [];
            room.members.push(userID);
            const persistedRoom: Room = await saveGameRoom(room);
            socket.join(persistedRoom.id);
            
            // Send created room to clients so that the room appears in the room list in "Games".
            io.of(NAMESPACE_GAMES_ENDPOINT).emit(UPDATE_ROOMS, persistedRoom);
        });

        socket.on(CHAT_MESSAGE, (message: Message) => {
            if ([...socket.rooms].find((roomID: string) => roomID === message.to)) {     // Check if socket is member of room
                saveMessage(message);
                io.of(NAMESPACE_GAMES_ENDPOINT).to(message.to).emit(CHAT_MESSAGE, message);
            }
        });

        socket.on(CHANGE_ROOM, async (roomID: string, userID: string) => {
            socket.join(roomID);
            const isRoomMember = await isMember(userID, roomID);

            if (!isCommonRoom(roomID) && !isRoomMember) {
                // If changing to a custom game room that the client is not a member of, send back the room containing its message history.
                const room = await getRoomByID(roomID);
                io.of(NAMESPACE_GAMES_ENDPOINT).to(socket.id).emit(UPDATE_CUSTOM_GAME_ROOM, room);
            }

            await addUserToRoom(userID, roomID);
            io.of(NAMESPACE_GAMES_ENDPOINT).emit(USER_JOINED, roomID, userID, NAMESPACE_ID_GAMES);
        });

        socket.on(LEAVE_ROOM, async (roomID: string, userID: string) => {
            socket.leave(roomID);
            await removeUserFromRoom(userID, roomID);

            io.of(NAMESPACE_GAMES_ENDPOINT).emit(USER_LEFT, roomID, userID, NAMESPACE_ID_GAMES);
        });
    });
}

/**
 * Create the "Games" namespace and the common "Lobby" room if the namespace does not exist.
 */
async function createDatabaseCollections(): Promise<void> {
    const exists = await Namespace.exists({ name: 'Games' });
    if (!exists) {
        const gamesNamespace = new Namespace({
            _id: NAMESPACE_ID_GAMES,
            name: 'Games',
            endpoint: NAMESPACE_GAMES_ENDPOINT,
            image: 'games.svg'
        });
        
        await gamesNamespace.save();
    }

    const roomExists = await RoomSchema.exists({ name: ROOM_NAME_LOBBY });
    if (!roomExists) {
        const lobbyRoom = new RoomSchema({
            name: ROOM_NAME_LOBBY,
            namespaceId: NAMESPACE_ID_GAMES
        });

        await lobbyRoom.save();
    }
}