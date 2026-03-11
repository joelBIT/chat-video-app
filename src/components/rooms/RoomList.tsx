import { useState, type ReactElement } from "react";
import { useUser } from "../../hooks";
import { isSelectedNamespace } from "../../clientApplication/services/namespaceService";
import { getSelectedNamespaceRooms, memberGameRooms, nonMemberGameRooms } from "../../clientApplication/services/roomService";
import { CommonRoomCard, CreateRoomModal, RoomCard } from "..";
import type { Room } from "../../types";
import { NAMESPACE_ID_GAMES } from "../../../socketApplication/utils";

import "./RoomList.css";

/**
 * Shows the existing rooms for the selected Namespace.
 */
export function RoomList(): ReactElement {
    const [openModal, setOpenModal] = useState<boolean>(false);
    const { user } = useUser();

    /**
     * Create a new room within the Games namespace (id 2). If selected namespace is not 2, do nothing.
     */
    function createRoom(): void {
        if (isSelectedNamespace(NAMESPACE_ID_GAMES)) {
            setOpenModal(true);
        }
    }

    if (isSelectedNamespace(NAMESPACE_ID_GAMES)) {
        return (
            <section id="roomList">
                <h1 className="rooms-title">Rooms</h1>
                <ul className="rooms-list scrollable">
                    {
                        memberGameRooms(user.id).map((room: Room) => <RoomCard key={room.id} room={room} />)
                    }
                </ul>

                { openModal ? <CreateRoomModal close={() => setOpenModal(false)} /> : <></> }

                <section className="available-game-rooms">
                    <h1 className="rooms-title">Available Rooms</h1>

                    <img 
                        src="/create_room.svg" 
                        alt="Create Room icon" 
                        title="Create Room" 
                        className="createRoom-button"
                        onClick={createRoom}
                    />
                </section>
                
                <ul className="rooms-list scrollable">
                    {
                        nonMemberGameRooms(user.id).map((room: Room) => <RoomCard key={room.id} room={room} />)
                    }
                </ul>
            </section>
        );
    }

    return (
        <section id="roomList">
            <h1 className="rooms-title">Rooms</h1>
                <ul className="rooms-list scrollable">
                    {
                        getSelectedNamespaceRooms().map((room: Room) => <CommonRoomCard key={room.id} room={room} />)
                    }
                </ul>
        </section>
    )
}