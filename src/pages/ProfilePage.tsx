import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { useRoom, useSocket, useUser } from "../hooks";
import { getUsersInSelectedRoom, saveUser } from "../clientApplication/services/userService";
import { NamespaceMenu } from "../components";
import type { TriviaUser } from "@/../../types";
import { HOME_URL } from "../../socketApplication/utils";

import "./ProfilePage.css";

/**
 * Page for viewing and updating profile information.
 */
export default function ProfilePage(): ReactElement {
    const navigate = useNavigate();
    const { user, setUserInformation } = useUser();
    const { isConnected, updateUser } = useSocket();
    const { setRoomParticipants } = useRoom();
    const [selectedAvatar, setSelectedAvatar] = useState<string>(user.avatar);
    const [username, setUsername] = useState<string>(user.username);
    const [message, setMessage] = useState<string>('');

    if (!isConnected) {
        navigate(HOME_URL);
    }

    /**
     * Updates the user by storing the information locally and sending the updated information to other clients.
     * Only update the profile information if the server sends back "success" = true.
     */
    async function updateUserProfile(): Promise<void> {
        const updatedUser: TriviaUser = { username, id: user.id, avatar: selectedAvatar, online: user.online };
        const response = await updateUser(updatedUser);
        if (response.success) {
            setUserInformation(updatedUser);
            saveUser(updatedUser);
            setRoomParticipants(getUsersInSelectedRoom());
        }
        setMessage(response.message);
    }

    return (
        <main id="profilePage">
            <NamespaceMenu />

            <section id="profile-information">
                <h1 className="profile-title"> Profile information </h1>

                 <section id="select-avatar">
                    <img 
                        src="/businessman_avatar.svg" 
                        alt="Profile businessman avatar" 
                        onClick={() => setSelectedAvatar("businessman_avatar.svg")}
                        className={selectedAvatar === "businessman_avatar.svg" ? "selected-avatar": ""}
                    />

                    <img 
                        src="/engineer_avatar.svg" 
                        alt="Profile engineer avatar" 
                        onClick={() => setSelectedAvatar("engineer_avatar.svg")} 
                        className={selectedAvatar === "engineer_avatar.svg" ? "selected-avatar": ""}
                    />

                    <img 
                        src="/doctor_avatar.svg" 
                        alt="Profile doctor avatar" 
                        onClick={() => setSelectedAvatar("doctor_avatar.svg")} 
                        className={selectedAvatar === "doctor_avatar.svg" ? "selected-avatar": ""}
                    />
                </section>

                <section className="profile-username">
                    <input placeholder="Username" value={username} onChange={event => setUsername(event.target.value)} />

                    <button disabled={username.length < 1} onClick={updateUserProfile}> Save </button>
                </section>

                {
                    message.length > 0 ?
                        <h2 className="message"> {message} </h2>
                        : <></>
                }
            </section>
        </main>
    )
}