import namespaceStore from "../stores/NamespaceStore";
import { getConversationsByUserID, getPrivateConversation } from "./messageService";
import type { Namespace, Room, ChatUser } from "../../types";
import { NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME } from "../utils";
import NamespaceSchema from "../schemas/namespaceSchema";
import RoomSchema from "../schemas/roomSchema";

export async function getNamespaceByID(namespaceID: number): Promise<Namespace> {
    const response = await NamespaceSchema.findById(namespaceID);
    if (response) {
        const rooms: Room[] = await RoomSchema.find({ namespaceId: namespaceID });

        const namespace: Namespace = {
            id: namespaceID,
            name: response.name,
            image: response.image,
            endpoint: response.endpoint,
            rooms: rooms
        }

        return namespace;
    }

    throw new Error(`No namespace found for ID ${namespaceID}`);
}

export function getAllNamespaces(): Namespace[] {
    return namespaceStore.getAllNamespaces();
}

/**
 * Send back namespaces with rooms, members and message history to a client when the client connects.
 */
export function getDataForUser(user: ChatUser): Namespace[] {
    const namespaces: Namespace[] = [];
    const homeNamespace: Namespace = JSON.parse(JSON.stringify(namespaceStore.findNamespaceByID(NAMESPACE_ID_HOME)));
    namespaces.push(homeNamespace);
    
    const dmNamespace: Namespace = JSON.parse(JSON.stringify(namespaceStore.findNamespaceByID(NAMESPACE_ID_DM)));
    dmNamespace.rooms = [];
    const conversations: string[] = getConversationsByUserID(user.id);
    conversations.forEach((recipientID: string) => {
        const room: Room = {id: recipientID, private: true, members: [user.id, recipientID], history: [], name: user.username, namespaceId: NAMESPACE_ID_DM};
        room.history.push(...getPrivateConversation(user.id, recipientID));
        dmNamespace.rooms.push(JSON.parse(JSON.stringify(room)));
    });
    namespaces.push(dmNamespace);

    const gamesNamespace: Namespace = JSON.parse(JSON.stringify(namespaceStore.findNamespaceByID(NAMESPACE_ID_GAMES)));
    namespaces.push(gamesNamespace);

    return JSON.parse(JSON.stringify(namespaces));
}