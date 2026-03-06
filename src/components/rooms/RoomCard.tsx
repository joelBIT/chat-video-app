import { type ReactElement } from "react";
import { useRoom, useUser } from "../../hooks";
import { isMember, isSelectedRoom } from "../../clientApplication/services/roomService";
import type { Room } from "../../types";
import { isCommonRoom, NAMESPACE_ID_GAMES } from "../../../socketApplication/utils";

import "./RoomCard.css";

/**
 * It is only possible to leave Game rooms (namespace id 2).
 */
export function RoomCard({room}: {room: Room}): ReactElement {
    const { changeRoom, leaveRoom } = useRoom();
    const { user } = useUser();

    function removeRoom(event: React.MouseEvent<HTMLHeadingElement>): void {
        event.stopPropagation();
        event.preventDefault();
        leaveRoom(room);
    }

    /**
     * It should only be possible to remove a room from the room list if the client is a member of that room and that room is a Game room created
     * by a client (any client). 
     * Return true if this room is a custom game room that the client is a member of.
     */
    function isRoomMember(): boolean {
        return !isCommonRoom(room.id) && room.namespaceId === NAMESPACE_ID_GAMES && isMember(user.id, room.id);
    }

    return (
        <section className="namespace-room" onClick={() => changeRoom(room)}>
            <section className="room-section">
                <img src={room.private ? "/lock.svg" : "/open_lock.svg"} className="room-icon" />
                <h2 className={isSelectedRoom(room.id) ? "active-room" : "room-name"}>
                    {room.name}
                </h2>
            </section>

            {
                isRoomMember() ? <h1 className="leave-room__button" onClick={removeRoom}> &#x274c; </h1> : <></>
            }
        </section>
    )
}