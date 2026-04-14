import { useState, type ReactElement } from "react";
import { useSocket } from "../../hooks";

export function LoginForm({close}: {close: () => void}): ReactElement {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const { connect, errorMessage } = useSocket();

    return (
        <form id="loginForm" method="post">
            <h1 className="loginForm-heading"> Sign in </h1>

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
                Want to register? Do it <div className="register-link" onClick={() => close()}> here </div>.
            </h4>

            {
                errorMessage.length > 0 ?
                    <h2 className="error-message"> {errorMessage} </h2>
                    : <></>
            }
        </form>
    )
}