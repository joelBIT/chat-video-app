import { type ReactElement } from "react";
import { useRoom, useUser } from "../../hooks";
import { hasUnreadMessages, isSelectedRoom } from "../../clientApplication/services/roomService";
import type { Room } from "../../types";
import { ROOM_NAME_ANNOUNCEMENTS } from "../../serverApplication/utils/constants";

import "./RoomCard.css";

/**
 * This is the room card for the common rooms in namespace Home (id 0).
 */
export function HomeRoomCard({room}: {room: Room}): ReactElement {
    const { user } = useUser();
    const { changeRoom } = useRoom();

    const unreadMessages = hasUnreadMessages(room, user.id);

    return (
        <section className="namespace-room" onClick={() => changeRoom(room)}>
            <section className="room-section">
                {
                    room.name === ROOM_NAME_ANNOUNCEMENTS ?
                        <img src={"/announcement.svg"} className="room-icon" />
                        :
                        <img src={"/grid.svg"} className="room-icon" />
                }

                <h2 className={isSelectedRoom(room.id) ? "active-room" : "room-name"}>
                    {room.name}
                </h2>

                {
                    unreadMessages > 0 ? <h1 className="unreadMessages"> {unreadMessages} </h1> : <></>
                }
            </section>
        </section>
    )
}