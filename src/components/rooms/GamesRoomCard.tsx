import { type ReactElement } from "react";
import { useRoom, useUser } from "../../hooks";
import { isMember, isSelectedRoom } from "../../clientApplication/services/roomService";
import type { Room } from "../../types";
import { isCommonRoom, NAMESPACE_ID_GAMES, ROOM_NAME_LOBBY } from "../../serverApplication/utils/constants";

import "./RoomCard.css";

/**
 * These room cards are only used for rooms in the Games namespace (id 2).
 * It is only possible to leave Game rooms (namespace id 2).
 */
export function GamesRoomCard({room}: {room: Room}): ReactElement {
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
        return !isCommonRoom(room.name) && room.namespaceId === NAMESPACE_ID_GAMES && isMember(user.id, room.id);
    }

    return (
        <section className="namespace-room" onClick={() => changeRoom(room)}>
            <section className="room-section">
                {
                    room.name === ROOM_NAME_LOBBY ?
                        <img src={"/grid.svg"} className="room-icon" />
                        :
                        <img src={room.private ? "/locked.svg" : "/unlocked.svg"} className="room-icon" />
                }
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