import type { Namespace, Room } from "../../types";
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
        rooms: mapRooms(rooms)
    }

    return namespace;
}

/**
 * Maps a room from the database to a room object used in the application.
 */
function mapRooms(rooms: Room[]): Room[] {
    const mappedRooms: Room[] = [];

    for (let i = 0; i < rooms.length; i++) {
        const room: Room = {
            id: rooms[i].id,
            name: rooms[i].name,
            namespaceId: rooms[i].namespaceId,
            private: rooms[i].private,
            members: rooms[i].members,
            history: []
        }

        mappedRooms.push(room);
    }

    return mappedRooms;
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
export async function getDataForUser(): Promise<Namespace[]> {
    const namespaces: Namespace[] = [];

    const homeNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_HOME);
    if (homeNamespace) {
        const mappedNamespace = await mapNamespace(NAMESPACE_ID_HOME, homeNamespace);
        namespaces.push(mappedNamespace);
    }
    
    const dmNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_DM);
    if (dmNamespace) {
        const mappedNamespace = await mapNamespace(NAMESPACE_ID_DM, dmNamespace);
        mappedNamespace.rooms = [];         // TODO: Add active conversations?

        namespaces.push(mappedNamespace);
    }

    const gamesNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_GAMES);
    if (gamesNamespace) {
        const mappedNamespace = await mapNamespace(NAMESPACE_ID_GAMES, gamesNamespace);
        namespaces.push(mappedNamespace);
    }

    return namespaces;
}