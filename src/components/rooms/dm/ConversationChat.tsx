import { type ReactElement, useRef, useState } from "react";
import { useMultiplex, useRoom, useUser } from "../../../hooks";
import { Message, ConversationHeader } from "../..";
import type { Message as MessageType } from "../../../types";

import "./ConversationChat.css";

/**
 * A DM room chat where a user may write messages to another user directly. An initiated or active WebRTC call locks the room by disabling menu links
 * so that a user must stay in the room during the call.
 */
export function DmRoomChat(): ReactElement {
    const [message, setMessage] = useState<string>('');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const { selectedRoom, sendMessage } = useRoom();
    const { activeCall, isCalling, hangup, cancelOffer } = useMultiplex();
    const { user } = useUser();

    /**
     * Send a DM to another user.
     */
    function sendDmMessage(event: React.KeyboardEvent): void {
        if (event.key ==="Enter" && message.length > 0 && selectedRoom) {
            sendMessage(message);
            setMessage('');
        }
    }

    if (!selectedRoom) {
        return (
            <main id="conversationChat">
                <h1 className="select-room__text"> Select a conversation </h1>
            </main>
        )
    }
    
    return (
        <section id="conversationChat" className={activeCall || isCalling ? "inCall-lock-room" : ""}>
            <ConversationHeader />

            <section id="videos" className={isCalling || activeCall ? "show-videos" : "hide-videos"}>
                <video id="local-video" className="video-player" ref={localVideoRef} autoPlay playsInline />

                <video id="remote-video" className="video-player" ref={remoteVideoRef} autoPlay playsInline />
            </section>

            {
                activeCall ?
                    <section className="call-text__section">
                        <p className="call__text"> In a call with {selectedRoom.name} </p>
                        <button className="app-button" onClick={() => hangup(user.username)}> Hangup </button> 
                    </section>
                :
                isCalling ?
                    <section className="call-text__section">
                        <p className="call__text"> Calling {selectedRoom.name}... </p>
                        <button className="app-button" onClick={() => cancelOffer(user.username, selectedRoom.name)}> Hangup </button> 
                    </section>
                :
                <></>
            }

            <section id="message-area" className="scrollable">
                {
                    selectedRoom.history
                        .sort((message1: MessageType, message2: MessageType) => message2.date - message1.date)
                        .map((message: MessageType, index: number) => <Message key={index} message={message}/>)
                }
            </section>

            <section id="chat-message">
                <input 
                    id="text-input" 
                    className="text-input" 
                    placeholder={`Message @${selectedRoom.name}`}
                    value={message}
                    onChange={e => setMessage(e.target.value)} 
                    onKeyUp={sendDmMessage} 
                    autoComplete="off"
                />
            </section>
        </section>
    )
}