import { type ReactElement } from "react";
import { useRoom } from "../../../hooks";
import { isSelectedRoom } from "../../../clientApplication/services/roomService";
import type { Room } from "../../../types";

import "./ConversationCard.css";

/**
 * A DM Card showing the name of the other user in this conversation.
 */
export function ConversationCard({room}: {room: Room}): ReactElement {
    const { changeRoom, leaveRoom } = useRoom();

    function removeConversation(event: React.MouseEvent<HTMLHeadingElement>): void {
        event.stopPropagation();
        event.preventDefault();
        leaveRoom(room);
    }

    return (
        <section className="conversationCard" onClick={() => changeRoom(room)}>
            <section className="dm-section">
                <h2 className={isSelectedRoom(room.id) ? "active-dm" : "dm-name"}>
                    {room.name}
                </h2>
            </section>

            <h1 className="leave-dm__button" onClick={removeConversation}> &#x274c; </h1>
        </section>
    )
}