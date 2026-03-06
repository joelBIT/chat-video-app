import { useState, type ReactElement } from "react";
import { useUser } from "../../hooks";
import { MenuModal } from "..";
import type { ChatUser } from "../../types";

import "./UserCard.css";

/**
 * Represents a user in the user list. Initiate a private conversation by clicking on the user card.
 */
export function UserCard({member}: {member: ChatUser}): ReactElement {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { user } = useUser();

    /**
     * Open menu modal if the clicked user card is not the client him/herself.
     */
    function openMenu(): void {
        if (member.id.localeCompare(user.id) !== 0) {
            setOpenModal(true);
        }
    }

    return (
        <section className={member.username === user.username ? "userCard userCard-client" : "userCard"} onClick={openMenu}>
            <article className="user-image">
                <img src={member.avatar} alt="User Avatar" className="user-avatar" />
                <div className={member.online ? "online-status online" : "online-status"} />
            </article>

            <h2 className="user-username"> {member.username} </h2>

            { openModal ? <MenuModal member={member} isOpen={openModal} close={() => setOpenModal(false)} /> : <></> }
        </section>
    )
}