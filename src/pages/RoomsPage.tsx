import { type ReactElement } from "react";
import { redirect } from "react-router";
import { useRoom, useSocket } from "../hooks";
import { isSelectedNamespace } from "../clientApplication/services/namespaceService";
import { NamespaceMenu, RoomChat, RoomList, UserList } from "../components";
import { HOME_URL, NAMESPACE_ID_DM } from "../../socketApplication/utils";

import "./page.css";

/**
 * Page containing the namespace menu and list of rooms (including the chat of the selected room).
 * If a room is private (meaning direct communication between two users) no user list is shown.
 */
export default function RoomsPage(): ReactElement {
    const { isConnected } = useSocket();
    const { roomParticipants } = useRoom();

    if (!isConnected) {
        redirect(HOME_URL);
    }

    return (
        <main id="roomsPage">
            <NamespaceMenu />
            <RoomList />
            <RoomChat />

            {
                isSelectedNamespace(NAMESPACE_ID_DM) || roomParticipants?.length === 0 ? <></> : <UserList />
            }
        </main>
    )
}