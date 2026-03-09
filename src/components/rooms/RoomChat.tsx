import { type ReactElement, useState } from "react";
import { useRoom } from "../../hooks";
import { Message } from "..";
import type { Message as MessageType } from "../../types";

import "./RoomChat.css";

/**
 * A chat where a user may write messages to other users in the same room.
 */
export function RoomChat(): ReactElement {
    const [message, setMessage] = useState<string>('');
    const { selectedRoom, sendMessage } = useRoom();

    /**
     * Send message to selected room.
     */
    function sendChatMessage(event: React.KeyboardEvent): void {
        if (event.key ==="Enter" && message.length > 0 && selectedRoom) {
            sendMessage(message);
            setMessage('');
        }
    }

    if (!selectedRoom) {
        return (
            <main id="roomChat">
                <h1 className="select-room__text"> Select a room </h1>
            </main>
        )
    }
    
    return (
        <section id="roomChat">
            <section className="room-title">
                <img src={selectedRoom.private ? "/lock.svg" : "/open_lock.svg"} className="room-icon" />
                <h1 className="room-text">{selectedRoom?.name}</h1>
            </section>

            <section id="message-area">
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
                    placeholder={`Message #${selectedRoom.name}`}
                    value={message}
                    onChange={e => setMessage(e.target.value)} 
                    onKeyUp={sendChatMessage} 
                />
            </section>
        </section>
    )
}