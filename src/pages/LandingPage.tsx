import { type ReactElement, useState } from "react";
import { Navigate } from "react-router";
import { useSocket } from "../hooks";
import { LoginForm, RegisterForm } from "../components";
import { ROOMS_URL } from "../serverApplication/utils/constants";

import "./LandingPage.css";

/**
 * Landing page of the application. A user must log in before getting access to the chat application.
 */
export default function LandingPage(): ReactElement {
    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);
    const { isReady } = useSocket();

    if (isReady) {
        return <Navigate to={ROOMS_URL} replace />;
    }
    
    return (
        <main id="landingPage">            
            {
                showRegisterForm ? 
                    <RegisterForm close={() => setShowRegisterForm(false)} />
                :
                    <LoginForm close={() => setShowRegisterForm(true)} />
            }
        </main>
    )
}