import { type ReactElement } from "react";
import { useRoom } from "../../hooks";
import { isSelectedRoom } from "../../clientApplication/services/roomService";
import type { Room } from "../../types";
import { ROOM_NAME_ANNOUNCEMENTS } from "../../serverApplication/utils";

import "./RoomCard.css";

/**
 * This is the room card for the common rooms in namespace Home (id 0).
 */
export function CommonRoomCard({room}: {room: Room}): ReactElement {
    const { changeRoom } = useRoom();

    return (
        <section className="namespace-room" onClick={() => changeRoom(room)} key={room.id}>
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
            </section>
        </section>
    )
}