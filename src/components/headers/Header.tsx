import { type ReactElement } from "react";
import { useMultiplex, useSocket } from "../../hooks";
import { AnswerCallModal } from "..";

import "./Header.css";

export function Header(): ReactElement {
    const { isConnected } = useSocket();
    const { incomingCall, answerCall, denyCall } = useMultiplex();

    return (
        <header id="header"> 
            <section className="status-lamp">
                <div className={isConnected ? "green" : "red"} />
                <p className="status-text"> {isConnected ? "Connected" : "Disconnected"} </p>
            </section>
            
            <h1 className="app-title"> Chat App </h1>
            <div />

            {
                incomingCall ? <AnswerCallModal answerCall={answerCall} denyCall={denyCall} /> : <></>
            }
        </header>
    )
}