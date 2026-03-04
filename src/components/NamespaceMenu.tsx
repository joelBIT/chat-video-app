'use client';

import { ReactElement, useState } from "react";
import { redirect, usePathname } from "next/navigation";
import { useRoom, useSocket } from "../_hooks";
import { CreateRoomModal } from ".";
import { getNamespaces, isSelectedNamespace } from "../_clientApplication/services/namespaceService";
import { NamespaceID } from "@/socketApplication/enums";
import { Namespace } from "../_types/types";

import "./NamespaceMenu.css";

/**
 * Menu containing images for the available namespaces. A user can click on each namespace image to change selected namespace.
 */
export function NamespaceMenu(): ReactElement {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const pathname = usePathname();
    const { logout } = useSocket();
    const { changeNamespace } = useRoom();

    /**
     * Create a new room within the Games namespace (id 2). If selected namespace is not 2, do nothing.
     */
    function createRoom(): void {
        if (isSelectedNamespace(NamespaceID.GAMES)) {
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
        if (pathname !== "/rooms") {
            redirect("/rooms");
        }
    }

    return (
        <section id="namespaceMenu">
            <section className="namespace-buttons">
                {
                    getNamespaces().map(namespace => 
                        <section 
                            key={namespace.id} 
                            className={isSelectedNamespace(namespace.id) && pathname === "/rooms" ? "active-namespace" : "namespace"} 
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
                    className={isSelectedNamespace(NamespaceID.GAMES) && pathname === "/rooms" ? "createRoom-button" : "disabled-button"} 
                    onClick={createRoom}
                />
            </section>

            <section className="other-buttons">
                <img 
                    src="/profile.svg" 
                    alt="Profile icon" 
                    title="Profile" 
                    className={pathname === "/profile" ? "active-profile-button" : "profile-button"} 
                    onClick={() => redirect("/profile")}
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