import { type ReactElement, useRef } from "react";
import { useMultiplex, useRoom, useUser } from "../../hooks";
import { Message } from "..";
import { getSelectedRoom } from "../../clientApplication/services/roomService";
import { call } from "../../clientApplication/webRTC";
import type { Message as MessageType } from "../../types";

import "./DmRoom.css";

/**
 * A DM room chat where a user may write messages to another user directly.
 */
export function DmRoom(): ReactElement {
    const messageRef = useRef<HTMLInputElement>(null);
    const { selectedRoom, sendMessage } = useRoom();
    const { user } = useUser();
    const { incomingCall, answerCall } = useMultiplex();

    /**
     * Send a DM to another user.
     */
    function sendDmMessage(): void {
        if (messageRef.current?.value && selectedRoom) {
            sendMessage(messageRef.current?.value);
        }
    }

    if (!selectedRoom) {
        return (
            <main id="dmRoom">
                <h1 className="select-room__text"> Select a conversation </h1>
            </main>
        )
    }
    
    return (
        <section id="dmRoom">
            <section id="message-area">
                {
                    selectedRoom.history
                        .sort((message1: MessageType, message2: MessageType) => message2.date - message1.date)
                        .map((message: MessageType, index: number) => <Message key={index} message={message}/>)
                }
            </section>

            <section id="chat-message">
                {
                    incomingCall ? <button onClick={answerCall}> Answer </button> : <></>
                }
                <button onClick={() => call(user.username, getSelectedRoom()?.name)}> Call </button>
                <input placeholder="Enter message" ref={messageRef} />
                <button onClick={sendDmMessage}> Send </button>
            </section>
        </section>
    )
}