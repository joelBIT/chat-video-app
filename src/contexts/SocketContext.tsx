'use client';

import { createContext, type ReactElement, type ReactNode, useEffect, useState } from "react";
import { socket } from "../socket-client";
import { useMultiplex, useRoom, useUser } from "../hooks";
import { clearSelectedRoom, getSelectedRoom, isSelectedRoom } from "../clientApplication/services/roomService";
import { addAllUsers, getSignedOutUser, getUsersInSelectedRoom, saveUser } from "../clientApplication/services/userService";
import { addNamespaces } from "../clientApplication/services/namespaceService";
import type { ActionState, Namespace, TriviaUser } from "../../types";
import { NAMESPACE_ID_HOME, NAMESPACES, ROOM_ID_NONE, USER_CONNECTED, USER_DISCONNECTED, USER_UPDATED } from "../../socketApplication/utils";

export interface SocketContextProvider {
    isConnected: boolean;
    errorMessage: string;
    logout: () => void;
    connect: (username: string) => void;
    updateUser: (updatedUser: TriviaUser) => Promise<ActionState>;
}

export const SocketContext = createContext<SocketContextProvider>({} as SocketContextProvider);

/**
 * This provider handles the interaction with the socket (the main application socket, not the multiplex sockets).
 * The main socket is about connecting/disconnecting to/from the socket server, and related connection issues.
 * After a successful connection the server sends the namespaces to this client (onNamespaces function).
 */
export function SocketProvider({ children }: { children: ReactNode }): ReactElement {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { setUserInformation } = useUser();
    const { setRoomParticipants, changeNamespace, changeSelectedRoom } = useRoom();
    const { connectMultiplexSockets, disconnectMultiplexSockets } = useMultiplex();

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        function onConnect(): void {
            setIsConnected(true);
        }

        function onDisconnect(): void {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);                        // You connect
        socket.on(NAMESPACES, onNamespaces);
        socket.on("disconnect", onDisconnect);
        socket.on(USER_CONNECTED, onUserConnected);            // Another client connects
        socket.on(USER_DISCONNECTED, onUserDisconnected);
        socket.on(USER_UPDATED, onUserUpdated);
        socket.on("connect_error", onConnectError);
        socket.io.on("reconnect", onReconnect);     // Manager event

        return () => {
            socket.off("connect", onConnect);
            socket.off(NAMESPACES, onNamespaces);
            socket.off("disconnect", onDisconnect);
            socket.off(USER_CONNECTED, onUserConnected);
            socket.off(USER_DISCONNECTED, onUserDisconnected);
            socket.off(USER_UPDATED, onUserUpdated);
            socket.off("connect_error", onConnectError);
            socket.io.off("reconnect", onReconnect);
        };
    }, []);

    /**
     * Get available namespaces from the server. This function is only invoked when the client
     * connects to the server. A multiplex socket is created for each namespace received from the server.
     */
    async function onNamespaces(namespaces: Namespace[], user: TriviaUser, members: TriviaUser[]): Promise<void> {
        setUserInformation(user);
        addAllUsers(members);
        addNamespaces(namespaces);

        connectMultiplexSockets(namespaces);
        changeNamespace(NAMESPACE_ID_HOME);              // Set namespace Home (id 0) as default so that these rooms get listed for the client
    }

    /**
     * Store error message on connection error.
     */
    function onConnectError(error: Error): void {
        setErrorMessage(error.message);
    }

    function onReconnect(attempt: number): void {
        console.log(`Successful reconnect on attempt ${attempt}`);
    }

    /**
     * Remove user and disconnect socket when logging out. Disconnects all multiplex sockets before closing the connection.
     * Selected room is cleared so user must select room when signing in again.
     */
    function logout(): void {
        setUserInformation(getSignedOutUser());
        clearSelectedRoom();
        changeSelectedRoom(getSelectedRoom());

        disconnectMultiplexSockets();
        socket.disconnect();            // close connection
    }

    /**
     * Add username to the socket before connecting (usernames on the server should be unique).
     */
    async function connect(username: string): Promise<void> {
        socket.auth = { username };
        socket.io.opts.query = { username };

        socket.connect();
        setErrorMessage('');
    }

    /**
     * Updates users when a user connects to the application (e.g., to see updated online status).
     */
    function onUserConnected(user: TriviaUser): void {
        saveUser(user);
        if (!isSelectedRoom(ROOM_ID_NONE)) {
            setRoomParticipants(getUsersInSelectedRoom());
        }
    }

    /**
     * Updates users when a user disconnects from the application (e.g., to see updated online status).
     */
    function onUserDisconnected(user: TriviaUser): void {
        saveUser(user);
        if (!isSelectedRoom(ROOM_ID_NONE)) {
            setRoomParticipants(getUsersInSelectedRoom());
        }
    }

    /**
     * Update the stored information about the user. Update users in the user list to show new username or avatar (if changed).
     */
    function onUserUpdated(updatedUser: TriviaUser): void {
        saveUser(updatedUser);
        setRoomParticipants(getUsersInSelectedRoom());
    }

    /**
     * Send updated user information to other clients.
     */
    async function updateUser(updatedUser: TriviaUser): Promise<ActionState> {
        return await socket.emitWithAck(USER_UPDATED, updatedUser);
    }

    return (
        <SocketContext.Provider value={{ isConnected, errorMessage, logout, connect, updateUser }}>
            { children }
        </SocketContext.Provider>
    );
}