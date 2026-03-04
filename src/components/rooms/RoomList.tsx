'use client';

import { type ReactElement } from "react";
import { useUser } from "../../hooks";
import { isSelectedNamespace } from "../../clientApplication/services/namespaceService";
import { getSelectedNamespaceRooms, memberGameRooms, nonMemberGameRooms } from "../../clientApplication/services/roomService";
import { RoomCard } from "..";
import type { Room } from "../../../types";
import { NAMESPACE_ID_GAMES } from "../../../socketApplication/utils";

import "./RoomList.css";

/**
 * Shows the existing rooms for the selected Namespace.
 */
export function RoomList(): ReactElement {
    const { user } = useUser();

    if (isSelectedNamespace(NAMESPACE_ID_GAMES)) {
        return (
            <section id="roomList">
                <h1 className="rooms-title">Rooms</h1>
                <ul className="rooms-list">
                    {
                        memberGameRooms(user.id).map((room: Room) => <RoomCard key={room.id} room={room} />)
                    }
                </ul>

                <h1 className="rooms-title">Available Rooms</h1>
                <ul className="rooms-list">
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
                <ul className="rooms-list">
                    {
                        getSelectedNamespaceRooms().map((room: Room) => <RoomCard key={room.id} room={room} />)
                    }
                </ul>
        </section>
    )
}