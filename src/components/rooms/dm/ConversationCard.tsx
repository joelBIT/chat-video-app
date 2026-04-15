import { type ReactElement } from "react";
import { useRoom } from "../../../hooks";
import { isSelectedRoom } from "../../../clientApplication/services/roomService";
import type { Room } from "../../../types";

import "./ConversationCard.css";

/**
 * A DM Card showing the name of the other user in this conversation.
 */
export function ConversationCard({room}: {room: Room}): ReactElement {
    const { changeRoom } = useRoom();

    return (
        <section className="conversationCard" onClick={() => changeRoom(room)}>
            <h2 className={isSelectedRoom(room.id) ? "active-dm" : "remote-username"}>
                {room.name}
            </h2>
        </section>
    )
}