import { type ReactElement } from "react";
import { useSocket } from "../hooks";

import "./Header.css";

export function Header(): ReactElement {
    const { isConnected } = useSocket();

    return (
        <header id="header"> 
            <section className="status-lamp">
                <div className={isConnected ? "green" : "red"} />
                <p className="status-text"> {isConnected ? "Connected" : "Disconnected"} </p>
            </section>
            
            <h1 className="app-title"> Chat App </h1>
            <div />
        </header>
    )
}