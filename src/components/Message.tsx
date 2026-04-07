import { useEffect, useState, type ReactElement } from "react";
import Textarea from 'rc-textarea';
import { useRoom } from "../hooks";
import type { ChatUser, Message } from "../types";

import "./Message.css";

/**
 * A chat room message.
 */
export function Message({message}: {message: Message}): ReactElement {
    const [avatar, setAvatar] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const { roomParticipants } = useRoom();

    useEffect(() => {
        const user: ChatUser | undefined = roomParticipants.find((user: ChatUser) => user.id === message.from);
        if (user) {
            setAvatar(user.avatar);
            setUsername(user.username);
        }
    }, [])
    
    return (
        <section className="message">
            <img src={"/" + avatar} alt="Avatar of the message sender" className="message-avatar" />

            <section className="message-content">
                <div className="message-metadata">
                    <h5 className="message-sender"> {username} </h5>
                    <p className="message-date"> {new Date(message.date).toLocaleTimeString()} </p> 
                </div>

                 <Textarea name="message-text" className="message-text" value={message.text} readOnly autoSize={true}/>
            </section>
        </section>
    )
}