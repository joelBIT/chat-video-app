import { type ReactElement, useState } from "react";
import { useNavigate } from "react-router";
import { useRoom, useSocket, useUser } from "../hooks";
import { getUsersInSelectedRoom, saveUser } from "../clientApplication/services/userService";
import { NamespaceMenu } from "../components";
import type { ActionState, ChatUser } from "../types";
import { HOME_URL } from "../serverApplication/utils/constants";

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
    const [updatedResponse, setUpdatedResponse] = useState<ActionState>({message: '', success: false});

    if (!isConnected) {
        navigate(HOME_URL);
    }

    /**
     * Updates the user by storing the information locally and sending the updated information to other clients.
     * Only update the profile information if the server sends back "success" = true.
     */
    async function updateUserProfile(): Promise<void> {
        const updatedUser: ChatUser = { username: user.username, id: user.id, avatar: selectedAvatar, online: user.online, inCall: user.inCall };
        const response: ActionState = await updateUser(updatedUser);
        if (response.success) {
            setUserInformation(updatedUser);
            saveUser(updatedUser);
            setRoomParticipants(getUsersInSelectedRoom());
        }
        setUpdatedResponse(response);
    }

    return (
        <main id="profilePage">
            <NamespaceMenu />

            <section id="profile-information">
                <h1 className="profile-title"> Profile information </h1>

                 <section id="select-avatar">
                    <h2 className="avatar-title"> Select Avatar </h2>

                    <section className="avatars">
                        <img 
                            src="/mario.png" 
                            alt="Mario avatar" 
                            onClick={() => setSelectedAvatar("mario.png")}
                            className={selectedAvatar === "mario.png" ? "selected-avatar": ""}
                        />

                        <img 
                            src="/wario.png" 
                            alt="Wario avatar" 
                            onClick={() => setSelectedAvatar("wario.png")} 
                            className={selectedAvatar === "wario.png" ? "selected-avatar": ""}
                        />

                        <img 
                            src="/mushroom.png" 
                            alt="Mushroom avatar" 
                            onClick={() => setSelectedAvatar("mushroom.png")} 
                            className={selectedAvatar === "mushroom.png" ? "selected-avatar": ""}
                        />
                    </section>
                </section>

                <button className="app-button" onClick={updateUserProfile}> Update </button>

                {
                    updatedResponse.message.length > 0 ?
                        <h2 className={updatedResponse.success ? "message" : "error-message"}> {updatedResponse.message} </h2>
                        : <></>
                }
            </section>
        </main>
    )
}