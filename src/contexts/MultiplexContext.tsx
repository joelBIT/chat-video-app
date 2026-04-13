import { createContext, useState, type ReactElement, type ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { multiplexSockets } from "../socket-client";
import { useRoom } from "../hooks";
import { getSelectedRoom, isSelectedRoom, removeRoom, saveRoom } from "../clientApplication/services/roomService";
import { addUserToRoom, getUsersInSelectedRoom, removeUserFromRoom } from "../clientApplication/services/userService";
import { saveConversationMessage, saveMessage } from "../clientApplication/services/messageService";
import { isSelectedNamespace } from "../clientApplication/services/namespaceService";
import { addAnswer, addNewIceCandidate, answerOffer, call, closeVideoCall } from "../clientApplication/services/webRtcService";
import type { Message, Namespace, Offer, Room } from "../types";
import { ANSWER_RESPONSE, CHAT_MESSAGE, DENY_CALL, END_CALL, NAMESPACE_ID_DM, NEW_OFFER_AWAITING, NEW_OFFER_CANCELLED, PRIVATE_MESSAGE, RECEIVED_ICE_CANDIDATE_FROM_SERVER, ROOM_ID_NONE, UPDATE_CUSTOM_GAME_ROOM, UPDATE_ROOMS, USER_JOINED, USER_LEFT } from "../serverApplication/utils/constants";

export interface MultiplexContextProvider {
    connectMultiplexSockets: (namespaces: Namespace[]) => void;
    incomingCall: boolean;
    activeCall: boolean;
    isCalling: boolean;
    remoteUsername: string;                 // Username of the remote user in a call/offer
    answerCall: () => Promise<void>;
    denyCall: () => void;
    hangup: (username: string) => void;
    cancelOffer: (callerUsername: string, remoteUsername: string) => void;
    initiateCall: (callerUsername: string, remoteUsername: string, video: boolean) => void;
    disconnectMultiplexSockets: () => void;
}

export const MultiplexContext = createContext<MultiplexContextProvider>({} as MultiplexContextProvider);

/**
 * This provider handles the connection/disconnection of the namespaces (except the main namespace "/", see SocketContext) and related interactions.
 * A Namespace is a communication channel that allows you to split the logic of your application over a single shared 
 * connection (also called "multiplexing").
 */
export function MultiplexProvider({ children }: { children: ReactNode }): ReactElement {
    const [incomingCall, setIncomingCall] = useState<boolean>(false);
    const [isCalling, setIsCalling] = useState<boolean>(false);
    const [activeCall, setActiveCall] = useState<boolean>(false);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [remoteUsername, setRemoteUsername] = useState<string>('');
    const { setRoomParticipants, changeNamespace, changeSelectedRoom } = useRoom();

    /**
     * A multiplex socket is created for each namespace.
     */
    function connectMultiplexSockets(namespaces: Namespace[]): void {
        if (multiplexSockets.length === 0) {
            const socketList: Socket[] = [];
            namespaces.forEach((namespace: Namespace) => {
                socketList.push(createMultiplexSocket(namespace));      // The list index corresponds to the namespace ID
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
    function createMultiplexSocket(namespace: Namespace): Socket {
        const socket = io(namespace.endpoint);
        socket.connect();
        socket.on(CHAT_MESSAGE, onChatMessage);
        socket.on(PRIVATE_MESSAGE, onPrivateMessage);
        socket.on(USER_JOINED, onUserJoined);
        socket.on(USER_LEFT, onUserLeft);
        socket.on(UPDATE_ROOMS, onUpdateRooms);
        socket.on(UPDATE_CUSTOM_GAME_ROOM, onUpdateCustomGameRoom);

        if (namespace.id === NAMESPACE_ID_DM) {
            socket.on(NEW_OFFER_AWAITING, onNewOfferAwaiting);
            socket.on(NEW_OFFER_CANCELLED, onNewOfferCancelled);
            socket.on(DENY_CALL, onDeniedCall);
            socket.on(ANSWER_RESPONSE, onAnswerResponse);
            socket.on(RECEIVED_ICE_CANDIDATE_FROM_SERVER, onReceivedIceCandidateFromServer);
        }

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
        if (isSelectedRoom(message.to)) {
            changeSelectedRoom(JSON.parse(JSON.stringify(getSelectedRoom())));
        }
    }

    /**
     * The room is only updated with the incoming message if the user is active in that room. Otherwise, the user
     * will get the message history later when changing to that room.
     */
    function onPrivateMessage(message: Message): void {
        saveConversationMessage(message);
        if (isSelectedRoom(message.to) || isSelectedRoom(message.from)) {
            changeSelectedRoom(JSON.parse(JSON.stringify(getSelectedRoom())));
        } else if (isSelectedNamespace(NAMESPACE_ID_DM)) {
            changeNamespace(NAMESPACE_ID_DM);          // Update list of rooms in namespace "DMs" (id 1) in case of new room
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

    /**
     * Answer an offer (an invitation for a WebRTC call) by sending back an answer accepting the offer for a call.
     */
    async function answerCall(): Promise<void> {
        setIncomingCall(false);
        await answerOffer(offers[0]);
        setRemoteUsername(offers[0].offererUserName);
        setActiveCall(true);
        setOffers([]);
    }

    /**
     * Deny an incoming call (i.e., a user chooses to not answer an incoming call). Inform the offerer (remote username) that the call was denied.
     */
    function denyCall(): void {
        setIncomingCall(false);
        multiplexSockets[NAMESPACE_ID_DM].emit(DENY_CALL, offers[0].offererUserName, offers[0].answererUserName);
        setOffers([]);
    }

    /**
     * Initiate a WebRTC call by creating and sending an offer to remoteUsername. The WebRTC call can either be a video call or an audio call.
     */
    function initiateCall(callerUsername: string, remoteUsername: string, video: boolean): void {
        setIsCalling(true);
        call(callerUsername, remoteUsername, video);
    }

    /**
     * End a call or withdraw an offer (depending on the isCalling boolean).
     */
    function hangup(username: string): void {
        closeVideoCall();
        setIncomingCall(false);
        setActiveCall(false);
        setOffers([]);
        multiplexSockets[NAMESPACE_ID_DM].emit(END_CALL, username);
        setRemoteUsername('');
    }

    function cancelOffer(username: string, remoteUsername: string): void {
        closeVideoCall();
        setIsCalling(false);
        setOffers([]);
        multiplexSockets[NAMESPACE_ID_DM].emit(NEW_OFFER_CANCELLED, username, remoteUsername);
        setRemoteUsername('');
    }

    /**
     * You received an offer for a WebRTC call. You then choose if you want to answer the call or deny it.
     */
    function onNewOfferAwaiting(offer: Offer): void {
        setIncomingCall(true);
        setOffers([...offers, offer]);
        setRemoteUsername(offer.offererUserName);
    }

    /**
     * The user who created the offer (callerUsername) cancelled the offer before you answered the offer.
     */
    function onNewOfferCancelled(callerUsername: string): void {
        const remainingOffers: Offer[] = offers.filter((offer: Offer) => offer.offererUserName !== callerUsername);
        setOffers([...remainingOffers]);
        setRemoteUsername('');
        setIncomingCall(false);
    }

    /**
     * You get an answer from another user when it was you who created the offer (initiated the call) for that user.
     */
    function onAnswerResponse(answer: Offer): void {
        addAnswer(answer);
        setRemoteUsername(answer.answererUserName)
        setActiveCall(true);
    }

    function onDeniedCall(denierUsername: string): void {
        console.log("DENIED CALL")
        console.log(denierUsername)
        setOffers([]);
        setRemoteUsername('');
        closeVideoCall();
        setIsCalling(false);
    }

    function onReceivedIceCandidateFromServer(iceCandidate: RTCIceCandidate): void {
        addNewIceCandidate(iceCandidate);
    }

    return (
        <MultiplexContext.Provider value={{ incomingCall, activeCall, isCalling, remoteUsername, connectMultiplexSockets, disconnectMultiplexSockets, cancelOffer, answerCall, denyCall, initiateCall, hangup }}>
            { children }
        </MultiplexContext.Provider>
    );
}