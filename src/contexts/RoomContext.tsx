import { createContext, type ReactElement, type ReactNode, useState } from "react";
import type { Message, Room, TriviaUser } from "../types";
import { multiplexSockets } from "../socket-client";
import { useUser } from "../hooks";
import { getUsersInRoom } from "../clientApplication/services/userService";
import { isSelectedNamespace, setSelectedNamespaceId } from "../clientApplication/services/namespaceService";
import { clearSelectedRoom, getRoom, getSelectedRoom, isSelectedRoom, saveRoom, setSelectedRoomId } from "../clientApplication/services/roomService";
import { CHANGE_ROOM, CHAT_MESSAGE, CREATE_ROOM, LEAVE_ROOM, NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, PRIVATE_MESSAGE, ROOM_ID_NONE } from "../../socketApplication/utils";

export interface RoomContextProvider {
    selectedRoom: Room | undefined;
    roomParticipants: TriviaUser[];
    sendMessage: (text: string) => void;
    changeRoom: (room: Room) => void;
    leaveRoom: (room: Room) => void;
    setRoomParticipants: (participants: TriviaUser[]) => void;
    changeNamespace: (namespaceID: number) => void;
    changeSelectedRoom: (room: Room | undefined) => void;
    createPrivateRoom: (recipient: TriviaUser) => void;
    createGameRoom: (roomName: string, privateRoom: boolean) => void;
}

export const RoomContext = createContext<RoomContextProvider>({} as RoomContextProvider);

/**
 * Keep track of selected room and its namespace. Each room belongs to a namespace. This provider sends namespace data to the socket server 
 * while MultiplexProvider receives namespace data from the socket server.
 */
export function RoomProvider({ children }: { children: ReactNode }): ReactElement {
    const [selectedRoom, setSelectedRoom] = useState<Room | undefined>(getSelectedRoom());
    const [roomParticipants, setRoomParticipants] = useState<TriviaUser[]>([]);
    const { user } = useUser();
    
    /**
     * Keep track of which room is currently selected. A room may be undefined if no room is selected.
     */
    function changeSelectedRoom(room: Room | undefined): void {
        setSelectedRoomId(room ? room.id : ROOM_ID_NONE);
        setSelectedRoom((_oldRoom: Room | undefined) => room);
    }

    /**
     * Change the selected namespace. The selected room is cleared and the user must choose a room in the new namespace. There are no room participants
     * when no room is selected.
     */
    function changeNamespace(namespaceID: number): void {
        if (!isSelectedNamespace(namespaceID)) {   // Clear selected room if changing to a different namespace
            clearSelectedRoom();
            setSelectedRoom(getSelectedRoom());     // Set undefined as selected room meaning no room is selected
        }

        setSelectedNamespaceId(namespaceID)
        setRoomParticipants([]);                                // No room is selected so no room members are shown
    }

    /**
     * When user clicks on another room (than the current room), this function is invoked to change the selected room and retrieve the room history.
     */
    function changeRoom(room: Room): void {
        if (!isSelectedRoom(room.id)) {
            multiplexSockets[room.namespaceId].emit(CHANGE_ROOM, room.id, user.id);
            setRoomParticipants(getUsersInRoom(room.id, room.namespaceId));
            changeSelectedRoom(getRoom(room.id, room.namespaceId));
        }
    }

    /**
     * When the client leaves a room the selected room is set to undefined (if the user leaves the currently selected room) 
     * which forces the client to select another room.
     */
    function leaveRoom(room: Room): void {
        multiplexSockets[room.namespaceId].emit(LEAVE_ROOM, room.id, user.id);
        if (isSelectedRoom(room.id)) {      // Do not clear selected room if user leaves another room than the currently active.
            clearSelectedRoom();
            setSelectedRoom(getSelectedRoom());
            setRoomParticipants([]);
        }
    }

    /**
     * Create a new private room in the "DMs" namespace (id 1).
     */
    async function createPrivateRoom(recipient: TriviaUser): Promise<void> {
        const response = await multiplexSockets[NAMESPACE_ID_DM].emitWithAck(CREATE_ROOM, user, recipient);
        saveRoom(response.room);
        setSelectedRoomId(response.room.id);
        changeSelectedRoom(response.room);
        setRoomParticipants([]);
        if (isSelectedNamespace(NAMESPACE_ID_DM)) {
            changeNamespace(NAMESPACE_ID_DM);        // Update UI
        }
    }

    /**
     * Create a new room in the "Games" namespace (id 2). The room ID is not set because the room will get a unique ID on the server when persisted.
     */
    function createGameRoom(roomName: string, privateRoom: boolean): void {
        const room: Room = {id: "", name: roomName, namespaceId: NAMESPACE_ID_GAMES, private: privateRoom, members: [], history: []};
        multiplexSockets[NAMESPACE_ID_GAMES].emit(CREATE_ROOM, room, user.id);
    }

    /**
     * Send a message to the server. The server will forward the message to all room members. Private messages always have namespace 1.
     */
    function sendMessage(text: string): void {
        if (selectedRoom) {
            const message: Message = {text, from: user, to: selectedRoom, date: Date.now()};
            if (isSelectedNamespace(NAMESPACE_ID_DM)) {
                multiplexSockets[NAMESPACE_ID_DM].emit(PRIVATE_MESSAGE, message);
            } else {
                multiplexSockets[message.to.namespaceId].emit(CHAT_MESSAGE, message);
            }
        }
    }

    return (
        <RoomContext.Provider value={{ selectedRoom, roomParticipants, createGameRoom, createPrivateRoom, sendMessage, changeRoom, leaveRoom, changeSelectedRoom, setRoomParticipants, changeNamespace }}>
            { children }
        </RoomContext.Provider>
    );
}