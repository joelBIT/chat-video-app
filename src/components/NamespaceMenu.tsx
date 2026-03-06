import { type ReactElement, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useRoom, useSocket } from "../hooks";
import { CreateRoomModal } from ".";
import { getNamespaces, isSelectedNamespace } from "../clientApplication/services/namespaceService";
import type { Namespace } from "../types";
import { NAMESPACE_ID_GAMES, PROFILE_URL, ROOMS_URL } from "../../socketApplication/utils";

import "./NamespaceMenu.css";

/**
 * Menu containing images for the available namespaces. A user can click on each namespace image to change selected namespace.
 */
export function NamespaceMenu(): ReactElement {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useSocket();
    const { changeNamespace } = useRoom();

    /**
     * Create a new room within the Games namespace (id 2). If selected namespace is not 2, do nothing.
     */
    function createRoom(): void {
        if (isSelectedNamespace(NAMESPACE_ID_GAMES)) {
            setOpenModal(true);
        }
    }

    /**
     * Only change namespace if chosen namespace is not already the selected namespace.
     */
    async function changeActiveNamespace(namespace: Namespace): Promise<void> {
        if (!isSelectedNamespace(namespace.id)) {
            changeNamespace(namespace.id);
        }
        if (location.pathname !== ROOMS_URL) {
            navigate(ROOMS_URL);
        }
    }

    return (
        <section id="namespaceMenu">
            <section className="namespace-buttons">
                {
                    getNamespaces().map(namespace => 
                        <section 
                            key={namespace.id} 
                            className={isSelectedNamespace(namespace.id) && location.pathname === ROOMS_URL ? "active-namespace" : "namespace"} 
                            onClick={() => changeActiveNamespace(namespace)}
                        >
                            <img 
                                src={`/${namespace.image}`} 
                                className="namespace-image" 
                                title={namespace.name} 
                                alt="Namespace icon"
                            />

                            <h2 className="namespace-name"> {namespace.name} </h2>
                        </section>
                    )
                }

                { openModal ? <CreateRoomModal close={() => setOpenModal(false)} /> : <></> }

                <img 
                    src="/create_room.svg" 
                    alt="Create Room icon" 
                    title="Create Room" 
                    className={isSelectedNamespace(NAMESPACE_ID_GAMES) && location.pathname === ROOMS_URL ? "createRoom-button" : "disabled-button"} 
                    onClick={createRoom}
                />
            </section>

            <section className="other-buttons">
                <img 
                    src="/profile.svg" 
                    alt="Profile icon" 
                    title="Profile" 
                    className={location.pathname === PROFILE_URL ? "active-profile-button" : "profile-button"} 
                    onClick={() => navigate(PROFILE_URL)}
                />

                <img 
                    src="/disconnect.svg" 
                    alt="Disconnect icon" 
                    title="Disconnect" 
                    className="disconnect-button" 
                    onClick={logout}
                />
            </section>
        </section>
    )
}