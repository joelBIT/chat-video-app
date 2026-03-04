'use client';

import { type ReactElement } from "react";
import Textarea from 'rc-textarea';
import type { Message } from "../../types";

import "./Message.css";

/**
 * A chat room message.
 */
export function Message({message}: {message: Message}): ReactElement {
    return (
        <section className="message">
            <img src={"/" + message.from.avatar} alt="Avatar of the message sender" className="message-avatar" />

            <section className="message-content">
                <div className="message-metadata">
                    <h5 className="message-sender"> {message.from.username} </h5>
                    <p className="message-date"> {new Date(message.date).toLocaleTimeString()} </p> 
                </div>

                 <Textarea name="message-text" className="message-text" value={message.text} readOnly autoSize={true}/>
            </section>
        </section>
    )
}