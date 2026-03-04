'use client';

import { ReactElement } from "react";
import { useRoom, useUser } from "../../_hooks";
import { setSelectedNamespaceId } from "@/app/_clientApplication/services/namespaceService";
import { NamespaceID } from "@/socketApplication/enums";
import { TriviaUser } from "../../_types/types";

import "./UserCard.css";

/**
 * Represents a user in the user list. Initiate a private conversation by clicking on the user card.
 */
export function UserCard({member}: {member: TriviaUser}): ReactElement {
    const { createPrivateRoom } = useRoom();
    const { user } = useUser();

    /**
     * When clicking on a user, change to private room in DM namespace and change selected room to that room.
     * If the user has clicked on himself/herself, do nothing.
     */
    function toPrivateRoom(): void {
        if (member.id.localeCompare(user.id) !== 0) {
            setSelectedNamespaceId(NamespaceID.DM);
            createPrivateRoom(member);
        }
    }

    return (
        <section className={member.username === user.username ? "userCard userCard-client" : "userCard"} onClick={toPrivateRoom}>
            <article className="user-image">
                <img src={member.avatar} alt="User Avatar" className="user-avatar" />
                <div className={member.online ? "online-status online" : "online-status"} />
            </article>

            <h2 className="user-username"> {member.username} </h2>
        </section>
    )
}