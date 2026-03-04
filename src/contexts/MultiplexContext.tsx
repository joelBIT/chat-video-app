import { createContext, type ReactElement, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { multiplexSockets } from "../socket-client";
import { useRoom } from "../hooks";
import { getSelectedRoom, isSelectedRoom, removeRoom, saveRoom } from "../clientApplication/services/roomService";
import { addUserToRoom, getUsersInSelectedRoom, removeUserFromRoom } from "../clientApplication/services/userService";
import { saveConversationMessage, saveMessage } from "../clientApplication/services/messageService";
import { isSelectedNamespace } from "../clientApplication/services/namespaceService";
import type { Message, Namespace, Room } from "../../types";
import { CHAT_MESSAGE, PRIVATE_MESSAGE, ROOM_ID_NONE, UPDATE_CUSTOM_GAME_ROOM, UPDATE_ROOMS, USER_JOINED, USER_LEFT } from "../../socketApplication/utils";

export interface MultiplexContextProvider {
    connectMultiplexSockets: (namespaces: Namespace[]) => void;
    disconnectMultiplexSockets: () => void;
}

export const MultiplexContext = createContext<MultiplexContextProvider>({} as MultiplexContextProvider);

/**
 * This provider handles the connection/disconnection of the namespaces (except the main namespace "/", see SocketContext) and related interactions.
 * A Namespace is a communication channel that allows you to split the logic of your application over a single shared 
 * connection (also called "multiplexing").
 */
export function MultiplexProvider({ children }: { children: ReactNode }): ReactElement {
    const { setRoomParticipants, changeNamespace, changeSelectedRoom } = useRoom();

    /**
     * A multiplex socket is created for each namespace.
     */
    function connectMultiplexSockets(namespaces: Namespace[]): void {
        if (multiplexSockets.length === 0) {
            const socketList: Socket[] = [];
            namespaces.forEach((namespace: Namespace) => {
                socketList.push(createMultiplexSocket(namespace.endpoint));      // The list index corresponds to the namespace ID
            });
            multiplexSockets.push(...socketList);
        } else {
            multiplexSockets.forEach((socket: Socket) => {
                socket.connect();
            });
        }
    }

    /**
     * Create a connected socket (for multiplexing) for the supplied namespace.
     */
    function createMultiplexSocket(endpoint: string): Socket {
        const socket = io(endpoint);
        socket.connect();
        socket.on(CHAT_MESSAGE, onChatMessage);
        socket.on(PRIVATE_MESSAGE, onPrivateMessage);
        socket.on(USER_JOINED, onUserJoined);
        socket.on(USER_LEFT, onUserLeft);
        socket.on(UPDATE_ROOMS, onUpdateRooms);
        socket.on(UPDATE_CUSTOM_GAME_ROOM, onUpdateCustomGameRoom);

        return socket;
    }

    /**
     * Add the user as a member of the joined room. Update participants if joined room is the client's selected room.
     */
    function onUserJoined(roomID: string, userID: string, namespaceID: number): void {
        addUserToRoom(roomID, userID, namespaceID);
        if (isSelectedRoom(roomID)) {
            setRoomParticipants(getUsersInSelectedRoom());
        }
    }

    /**
     * Update participants in room when a user leaves.
     */
    function onUserLeft(roomID: string, userID: string, namespaceID: number): void {
        removeUserFromRoom(roomID, userID, namespaceID);
        updateUI(namespaceID);
    }

    /**
     * Update list of private conversations when first message is received from a new user, or update list of game rooms 
     * when a new room has been created (since created Game rooms are visible to all users).
     */
    function onUpdateRooms(room: Room): void {
        saveRoom(room);
        updateUI(room.namespaceId);
    }

    /**
     * Updates the UI with new data when an event occurs.
     */
    function updateUI(namespaceID: number): void {
        if (isSelectedNamespace(namespaceID)) {
            changeNamespace(namespaceID);                          // Update the list of rooms in the UI
            if (!isSelectedRoom(ROOM_ID_NONE)) {
                setRoomParticipants(getUsersInSelectedRoom());      // Update list of room members in the UI since a room is selected
            }
        }
    }

    /**
     * Client that joins a game room created by another client receives the room here containing the room history etc.
     */
    function onUpdateCustomGameRoom(room: Room): void {
        removeRoom(room.id, room.namespaceId);
        saveRoom(room);
        if (isSelectedRoom(room.id)) {
            // Update chat room in the UI
            changeSelectedRoom(JSON.parse(JSON.stringify(getSelectedRoom())));
        }
    }

    /**
     * The room is only updated with the incoming message if the user is active in that room. Otherwise, the user
     * will get the message history later when changing to that room.
     */
    function onChatMessage(message: Message): void {
        saveMessage(message);
        if (isSelectedRoom(message.to.id)) {
            changeSelectedRoom(JSON.parse(JSON.stringify(getSelectedRoom())));
        }
    }

    /**
     * The room is only updated with the incoming message if the user is active in that room. Otherwise, the user
     * will get the message history later when changing to that room.
     */
    function onPrivateMessage(message: Message): void {
        saveConversationMessage(message);
        if (isSelectedRoom(message.to.id) || isSelectedRoom(message.from.id)) {
            changeSelectedRoom(JSON.parse(JSON.stringify(getSelectedRoom())));
        } else if (isSelectedNamespace(message.to.namespaceId)) {
            changeNamespace(message.to.namespaceId);          // Update list of rooms in namespace "DMs" (id 1) in case of new room
        }
    }

    /**
     * Disconnects all multiplex sockets.
     */
    function disconnectMultiplexSockets(): void {
        multiplexSockets.forEach((socket: Socket) => {
            if (socket.connected) {
                socket.disconnect();
            }
        });
    }

    return (
        <MultiplexContext.Provider value={{ connectMultiplexSockets, disconnectMultiplexSockets }}>
            { children }
        </MultiplexContext.Provider>
    );
}