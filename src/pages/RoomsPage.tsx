import { type ReactElement } from "react";
import { redirect } from "react-router";
import { useRoom, useSocket } from "../hooks";
import { isSelectedNamespace } from "../clientApplication/services/namespaceService";
import { ConversationList, DmRoomChat, MobileHeader, NamespaceMenu, RoomChat, RoomList, UserList } from "../components";
import { HOME_URL, NAMESPACE_ID_DM } from "../serverApplication/utils/constants";

import "./RoomsPage.css";

/**
 * Page containing the namespace menu and list of rooms (including the chat of the selected room).
 */
export default function RoomsPage(): ReactElement {
    const { isConnected } = useSocket();
    const { roomParticipants } = useRoom();

    if (!isConnected) {
        redirect(HOME_URL);
    }

    if (isSelectedNamespace(NAMESPACE_ID_DM)) {
        return (
            <main id="roomsPage">
                <NamespaceMenu />

                <MobileHeader isDmNamespace={true} />
                
                <ConversationList />
                <DmRoomChat />
            </main>
        )
    }

    return (
        <main id="roomsPage">
            <NamespaceMenu />

            <MobileHeader isDmNamespace={false} />

            <RoomList />
            <RoomChat />

            {
                roomParticipants?.length === 0 ? <></> : <UserList />
            }
        </main>
    )
}