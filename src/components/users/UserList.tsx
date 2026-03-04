'use client';

import { type ReactElement } from "react";
import { useRoom } from "../../hooks";
import { UserCard } from "..";
import type { TriviaUser } from "../../../types";

import "./UserList.css";

/**
 * Lists all users in currently selected room.
 */
export function UserList(): ReactElement {
    const { roomParticipants } = useRoom();

    if (!roomParticipants || roomParticipants?.length < 1) {
        return (
            <section id="userList">

            </section>
        )
    }

    return (
        <section id="userList">
            <h2 className="userList-title"> Members - {roomParticipants?.length} </h2>
            {
                roomParticipants.map((user: TriviaUser) => <UserCard key={user.username} member={user} />)
            }
        </section>
    )
}