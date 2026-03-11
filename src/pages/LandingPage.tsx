import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../hooks";
import { ROOMS_URL } from "../../socketApplication/utils";

import "./LandingPage.css";

/**
 * Landing page of the application. A user must log in before getting access to the chat application.
 */
export default function LandingPage(): ReactElement {
    const [username, setUsername] = useState<string>('');
    const navigate = useNavigate();
    const { isConnected, connect, errorMessage } = useSocket();

    if (isConnected) {
        navigate(ROOMS_URL, { replace: true });
    }
    
    return (
        <main id="landingPage">            
            <p className="landing-text"> Enter a username and connect to the Chat app </p>

            <section id="username-connection">
                <input className="login-input" placeholder="Username" onChange={event => setUsername(event.target.value)} />
                <button className="app-button" onClick={() => connect(username)} disabled={username.length < 1}> Connect </button>
            </section>

            {
                errorMessage.length > 0 ?
                    <h2 className="error-message"> {errorMessage} </h2>
                    : <></>
            }
        </main>
    )
}