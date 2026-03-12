import { type ReactElement, useState } from "react";
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
    const [isCalling, setIsCalling] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');
    const { selectedRoom, sendMessage } = useRoom();
    const { user } = useUser();
    const { incomingCall, activeCall, answerCall, hangup } = useMultiplex();

    /**
     * Send a DM to another user.
     */
    function sendDmMessage(event: React.KeyboardEvent): void {
        if (event.key ==="Enter" && message.length > 0 && selectedRoom) {
            sendMessage(message);
            setMessage('');
        }
    }

    /**
     * Parameter 'video' is true if it is a video call, otherwise false (only audio).
     */
    function callUser(video: boolean): void {
        const remoteUsername: string | undefined = getSelectedRoom()?.name;
        if (remoteUsername) {
            call(user.username, remoteUsername, video);
            setIsCalling(true);
        }
    }

    function endCall(): void {
        setIsCalling(false);
        hangup();
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
            <section id="videos">
                <video className="video-player" id="local-video" autoPlay playsInline />

                <video className="video-player" id="remote-video" autoPlay playsInline />
            </section>

            <section id="message-area" className="scrollable">
                {
                    selectedRoom.history
                        .sort((message1: MessageType, message2: MessageType) => message2.date - message1.date)
                        .map((message: MessageType, index: number) => <Message key={index} message={message}/>)
                }
            </section>

            <section id="chat-input-area">
                {
                    activeCall || isCalling ? <button className="app-button" onClick={endCall}> Hangup </button> 
                    : 
                    <section className="chat-buttons">
                        <article className="communication-button" onClick={() => callUser(false)}>
                            <img 
                                src="/audio.svg" 
                                alt="Audio chat icon" 
                                title="Call User" 
                                className="button__icon" 
                            />

                            <h2 className="button__label"> Audio </h2>
                        </article>

                        <article className="communication-button" onClick={() => callUser(true)}>
                            <img 
                                src="/video.svg" 
                                alt="Video chat icon" 
                                title="Video conference" 
                                className="button__icon" 
                            />

                            <h2 className="button__label"> Video </h2>
                        </article>
                    </section>
                }

                {
                    incomingCall ? <button className="app-button" onClick={answerCall}> Answer </button> : <></>       // TODO: Make incoming call a modal -> Answer/Deny
                }

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
        </section>
    )
}