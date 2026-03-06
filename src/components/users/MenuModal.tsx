import { useEffect, useRef, type ReactElement } from "react";
import { useRoom } from "../../hooks";
import { setSelectedNamespaceId } from "../../clientApplication/services/namespaceService";
import { NAMESPACE_ID_DM } from "../../../socketApplication/utils";
import type { TriviaUser } from "../../types";

import "./MenuModal.css";

/**
 * This menu modal is opened when a member card is clicked.
 */
export function MenuModal({member, isOpen, close}: {member: TriviaUser, isOpen: boolean, close: () => void}): ReactElement {
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

    function handleClickOutside(e: any) {
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
            <button onClick={toPrivateChatRoom}>Chat</button>
            <button>View Profile</button>
        </div>
    )
}