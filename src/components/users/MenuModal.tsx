import { useEffect, useRef, type ReactElement } from "react";
import { useRoom } from "../../hooks";
import { setSelectedNamespaceId } from "../../clientApplication/services/namespaceService";
import { NAMESPACE_ID_DM } from "../../../socketApplication/utils";
import type { ChatUser } from "../../types";

import "./MenuModal.css";

/**
 * This menu modal is opened when a member card is clicked.
 */
export function MenuModal({member, isOpen, close}: {member: ChatUser, isOpen: boolean, close: () => void}): ReactElement {
    const modalRef = useRef<HTMLDivElement>(null);
    const { createPrivateRoom } = useRoom();

     useEffect(() => {
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
        
    }, [isOpen, close]);

    function handleClickOutside(e: any): void {
        const value = e.target instanceof HTMLElement ? e.target : undefined;
        if (value && modalRef.current && !modalRef.current?.contains(value)) {
            close();
        }
    };

    /**
     * Change to private room in DM namespace and change selected room to that room.
     */
    function toPrivateChatRoom(): void {
        setSelectedNamespaceId(NAMESPACE_ID_DM);
        createPrivateRoom(member);
    }

    return (
        <div className="menu-modal" ref={modalRef}>
            <section className="menu-modal__header">
                <img src={member.avatar} alt="User Avatar" className="user-avatar" />
             
                <section className="menu-modal__status">
                    <h2 className="member-status"> {member.online ? "Online" : "Offline"} </h2>
             
                    <div className={member.online ? "online-status online" : "online-status"} />
                </section>
            </section>

            <section className="menu-modal__content">
                <h2 className="menu-modal__username"> {member.username} </h2>

                <article className="communication-button" onClick={toPrivateChatRoom}>
                    <img 
                        src="/chat-black.svg" 
                        alt="Text chat icon" 
                        title="Send DM" 
                        className="button__icon" 
                    />

                    <h2 className="button__label"> Chat </h2>
                </article>
            </section>
        </div>
    )
}