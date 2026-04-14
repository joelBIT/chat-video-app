import { useState, type ReactElement } from "react";
import type { ActionState } from "../../types";

/**
 * Form used to create a new user in the database.
 */
export function RegisterForm({close}: { close: () => void}): ReactElement {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [passwordRepeat, setPasswordRepeat] = useState<string>('');
    const [response, setResponse] = useState<ActionState>({message: '', success: false});

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

    return (
        <form id="registerForm" method="post">
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
                type="button"
                onClick={register} 
                disabled={username.length < 1 || password.length < 1 || passwordRepeat.length < 1}
            > 
                Register
            </button>

            <h4 className="login-text">
                Want to sign in? Do it <div className="login-link" onClick={() => close()}> here </div>.
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
        </form>
    )
}