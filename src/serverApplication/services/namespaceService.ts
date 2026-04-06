import { getConversationsByUserID, getPrivateConversation } from "./messageService";
import type { Namespace, Room, ChatUser } from "../../types";
import { NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME } from "../utils";
import NamespaceSchema from "../schemas/namespaceSchema";
import RoomSchema from "../schemas/roomSchema";

export async function getNamespaceByID(namespaceID: number): Promise<Namespace> {
    const response: Namespace | null = await NamespaceSchema.findById(namespaceID);
    if (response) {
        return await mapNamespace(namespaceID, response);
    }

    throw new Error(`No namespace found for ID ${namespaceID}`);
}

/**
 * Maps a namespace response from the database to a namespace object used in the application.
 */
async function mapNamespace(namespaceID: number, source: Namespace): Promise<Namespace> {
    const rooms: Room[] = await RoomSchema.find({ namespaceId: namespaceID });

    const namespace: Namespace = {
        id: namespaceID,
        name: source.name,
        image: source.image,
        endpoint: source.endpoint,
        rooms: rooms
    }

    return namespace;
}

export async function getAllNamespaces(): Promise<Namespace[]> {
    const namespaces: Namespace[] | null = await NamespaceSchema.find({});
    const result: Namespace[] = [];

    for (let i = 0; i < namespaces.length; i++) {
        const namespaceId = namespaces[i].id;
        const namespace: Namespace | null = namespaces[i];
        if (namespace && namespaceId) {
            const mappedNamespace = await mapNamespace(namespaceId, namespace);
            result.push(mappedNamespace);
        }
    }

    return result;
}

/**
 * Send back namespaces with rooms, members and message history to a client when the client connects.
 */
export async function getDataForUser(user: ChatUser): Promise<Namespace[]> {
    const namespaces: Namespace[] = [];

    const homeNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_HOME);
    if (homeNamespace) {
        const mappedNamespace = await mapNamespace(NAMESPACE_ID_HOME, homeNamespace);
        namespaces.push(mappedNamespace);
    }
    
    const dmNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_DM);
    if (dmNamespace) {
        dmNamespace.rooms = [];

        const conversations: string[] = await getConversationsByUserID(user.id);        // TODO: Remove this part?
        conversations.forEach(async (recipientID: string) => {
            const room: Room = {id: recipientID, private: true, members: [user.id, recipientID], history: [], name: user.username, namespaceId: NAMESPACE_ID_DM};
            room.history.push(...(await getPrivateConversation(user.id, recipientID)));
            dmNamespace.rooms.push(JSON.parse(JSON.stringify(room)));
        });

        namespaces.push(dmNamespace);
    }

    const gamesNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_GAMES);
    if (gamesNamespace) {
        const mappedNamespace = await mapNamespace(NAMESPACE_ID_GAMES, gamesNamespace);
        namespaces.push(mappedNamespace);
    }

    return namespaces;
}