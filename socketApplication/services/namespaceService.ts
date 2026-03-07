import namespaceStore from "../stores/namespaceStore";
import { getConversationsByUserID, getPrivateConversation } from "./messageService";
import { getUserByID } from "./userService";
import type { Namespace, Room, ChatUser } from "../../src/types";
import { NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME } from "../utils";

export function getNamespaceByID(namespaceID: number): Namespace {
    return namespaceStore.findNamespaceByID(namespaceID);
}

export function getAllNamespaces(): Namespace[] {
    return namespaceStore.getAllNamespaces();
}

/**
 * Send back namespaces with rooms, members and message history to a client when the client connects.
 */
export function getDataForUser(userID: string): Namespace[] {
    const namespaces: Namespace[] = [];
    const homeNamespace: Namespace = JSON.parse(JSON.stringify(namespaceStore.findNamespaceByID(NAMESPACE_ID_HOME)));
    namespaces.push(homeNamespace);
    
    const dmNamespace: Namespace = JSON.parse(JSON.stringify(namespaceStore.findNamespaceByID(NAMESPACE_ID_DM)));
    dmNamespace.rooms = [];
    const conversations: string[] = getConversationsByUserID(userID);
    conversations.forEach((recipientID: string) => {
        const user: ChatUser = getUserByID(recipientID);
        const room: Room = {id: recipientID, private: true, members: [userID, recipientID], history: [], name: user.username, namespaceId: NAMESPACE_ID_DM};
        room.history.push(...getPrivateConversation(userID, recipientID));
        dmNamespace.rooms.push(JSON.parse(JSON.stringify(room)));
    });
    namespaces.push(dmNamespace);

    const gamesNamespace: Namespace = JSON.parse(JSON.stringify(namespaceStore.findNamespaceByID(NAMESPACE_ID_GAMES)));
    namespaces.push(gamesNamespace);

    return JSON.parse(JSON.stringify(namespaces));
}