'use client';

import { ReactElement } from "react";
import { useUser } from "@/app/_hooks";
import { isSelectedNamespace } from "@/app/_clientApplication/services/namespaceService";
import { getSelectedNamespaceRooms, memberGameRooms, nonMemberGameRooms } from "@/app/_clientApplication/services/roomService";
import { RoomCard } from "..";
import { Room } from "@/app/_types/types";
import { NamespaceID } from "@/socketApplication/enums";

import "./RoomList.css";

/**
 * Shows the existing rooms for the selected Namespace.
 */
export function RoomList(): ReactElement {
    const { user } = useUser();

    if (isSelectedNamespace(NamespaceID.GAMES)) {
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