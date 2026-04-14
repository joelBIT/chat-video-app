import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../hooks";
import { RegisterForm } from "../components";
import { ROOMS_URL } from "../serverApplication/utils/constants";

import "./LandingPage.css";

/**
 * Landing page of the application. A user must log in before getting access to the chat application.
 */
export default function LandingPage(): ReactElement {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
    const navigate = useNavigate();
    const { isConnected, connect, errorMessage } = useSocket();

    if (isConnected) {
        navigate(ROOMS_URL, { replace: true });
    }
    
    return (
        <main id="landingPage">            
            {
                showRegisterForm ? 
                    <RegisterForm close={() => setShowRegisterForm(false)} />
                :
                    <section id="loginForm">
                        <p className="landing-text"> Sign in </p>

                        <input 
                            className="login-input" 
                            placeholder="Username"
                            name="username"
                            value={username}
                            onChange={event => setUsername(event.target.value)} 
                            autoComplete="off"
                        />

                        <input 
                            className="login-input" 
                            placeholder="Password" 
                            name="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)} 
                            autoComplete="off"
                        />
                        
                        <button 
                            className="app-button" 
                            onClick={() => connect(username, password)} 
                            disabled={username.length < 1 || password.length < 1}
                        > 
                            Sign in
                        </button>

                        <h4 className="register-text">
                            Want to register? Do it <div className="register-link" onClick={() => setShowRegisterForm(true)}> here </div>.
                        </h4>
                    </section>
            }

            {
                errorMessage.length > 0 ?
                    <h2 className="error-message"> {errorMessage} </h2>
                    : <></>
            }
        </main>
    )
}