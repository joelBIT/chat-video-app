import { type ReactElement, useState } from "react";
import { redirect } from "react-router";
import { useSocket } from "../hooks";
import { ROOMS_URL } from "../../socketApplication/utils";

import './App.css';

/**
 * Landing component of the application. A user must log in before getting access to the chat application.
 */
export function App(): ReactElement {
    const [username, setUsername] = useState<string>('');
    const { isConnected, connect, errorMessage } = useSocket();

    if (isConnected) {
        redirect(ROOMS_URL);
    }

    return (
        <main id="landingPage">            
            <p className="landing-text">Enter a username and connect to the Trivia app</p>

            <section id="username-connection">
                <input placeholder="Username" onChange={event => setUsername(event.target.value)} />
                <button onClick={() => connect(username)} disabled={username.length < 1}> Connect </button>
            </section>

            {
                errorMessage.length > 0 ?
                    <h2 className="error-message"> {errorMessage} </h2>
                    : <></>
            }
        </main>
    );
}