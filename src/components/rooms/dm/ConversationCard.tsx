import { type ReactElement } from "react";
import { useRoom, useUser } from "../../../hooks";
import { hasUnreadMessages, isSelectedRoom } from "../../../clientApplication/services/roomService";
import type { Room } from "../../../types";

import "./ConversationCard.css";

/**
 * A DM Card showing the name of the other user in this conversation.
 */
export function ConversationCard({room}: {room: Room}): ReactElement {
    const { changeRoom } = useRoom();
    const { user } = useUser();

    const unreadMessages = hasUnreadMessages(room, user.id);

    return (
        <section className="conversationCard" onClick={() => changeRoom(room)}>
            <h2 className={isSelectedRoom(room.id) ? "active-dm" : "remote-username"}>
                {room.name}
            </h2>

            {
                unreadMessages > 0 ? <h1 className="unreadMessages"> {unreadMessages} </h1> : <></>
            }
        </section>
    )
}