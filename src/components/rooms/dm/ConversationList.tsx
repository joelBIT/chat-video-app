import { type ReactElement } from "react";
import { getSelectedNamespaceRooms } from "../../../clientApplication/services/roomService";
import { ConversationCard } from "./ConversationCard";
import type { Room } from "../../../types";

import "./ConversationList.css";

/**
 * Shows the existing DM conversations for a user (Only namespace 1 (DMs)).
 */
export function ConversationList(): ReactElement {

    return (
        <section id="conversationList">
            <h1 className="conversations-title"> Conversations </h1>
            
                <ul className="conversations-list">
                    {
                        getSelectedNamespaceRooms().map((room: Room) => <ConversationCard key={room.id} room={room} />)
                    }
                </ul>
        </section>
    )
}