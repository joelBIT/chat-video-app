import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "../hooks";
import { ROOMS_URL } from "../serverApplication/utils/constants";
import type { ActionState } from "../types";

import "./LandingPage.css";

/**
 * Landing page of the application. A user must log in before getting access to the chat application.
 */
export default function LandingPage(): ReactElement {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordRepeat, setPasswordRepeat] = useState<string>('');
    const [showRegister, setShowRegister] = useState<boolean>(false);
    const [response, setResponse] = useState<ActionState>({message: '', success: false});
    const navigate = useNavigate();
    const { isConnected, connect, errorMessage } = useSocket();

    if (isConnected) {
        navigate(ROOMS_URL, { replace: true });
    }

    async function register(): Promise<void> {
        const response = await fetch('https://localhost:8181/register', {
            method: 'post',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ username, password, passwordRepeat })
        });

        const data: ActionState = await response.json();
        setResponse(data);
        if (data.success) {
            setUsername('');
            setPassword('');
            setPasswordRepeat('');
        }
    }

    function showRegisterForm(showRegister: boolean): void {
        setUsername('');
        setPassword('');
        setPasswordRepeat('');
        setResponse({message: '', success: false});
        setShowRegister(showRegister);
    }
    
    return (
        <main id="landingPage">            
            {
                showRegister ? 
                    <section id="username-connection">
                        <p className="landing-text"> Registration </p>

                        <input 
                            className="register-input" 
                            placeholder="Username" 
                            name="username"
                            value={username}
                            onChange={event => setUsername(event.target.value)} 
                            autoComplete="off"
                        />

                        <input 
                            className="register-input" 
                            placeholder="Password" 
                            name="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)} 
                            autoComplete="off"
                        />

                        <input 
                            className="register-input" 
                            placeholder="Repeat Password" 
                            name="passwordRepeat"
                            value={passwordRepeat}
                            onChange={event => setPasswordRepeat(event.target.value)} 
                            autoComplete="off"
                        />
                        
                        <button 
                            className="app-button" 
                            onClick={register} 
                            disabled={username.length < 1 || password.length < 1 || passwordRepeat.length < 1}
                        > 
                            Register
                        </button>

                        <h4 className="login-text">
                            Want to sign in? Do it <div className="login-link" onClick={() => showRegisterForm(false)}> here </div>.
                        </h4>

                        {
                            response.message.length > 0 && response.success ?
                                <h2 className="message"> {response.message} </h2>
                                : <></>
                        }

                        {
                            response.message.length > 0 && !response.success ?
                                <h2 className="error-message"> {response.message} </h2>
                                : <></>
                        }
                    </section>
                :
                    <section id="username-connection">
                        <p className="landing-text"> Connect to the Chat </p>

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
                            Want to register? Do it <div className="register-link" onClick={() => showRegisterForm(true)}> here </div>.
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