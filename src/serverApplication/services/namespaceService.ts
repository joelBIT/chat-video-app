import type { ChatUser, Message, Namespace, Room } from "../../types";
import { isCommonRoom, NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME } from "../utils";
import NamespaceSchema from "../schemas/namespaceSchema";
import RoomSchema from "../schemas/roomSchema";
import { getConversationsByUserID, getMessagesByRoomId, getPrivateConversation } from "./messageService";
import { getUserById } from "./userService";

/**
 * Maps a namespace response from the database to a namespace object used in the application.
 */
async function mapNamespace(namespaceID: number, source: Namespace): Promise<Namespace> {
    const rooms: Room[] = await RoomSchema.find({ namespaceId: namespaceID });
    const mappedRooms: Room[] = await mapRooms(rooms);

    const namespace: Namespace = {
        id: namespaceID,
        name: source.name,
        image: source.image,
        endpoint: source.endpoint,
        rooms: mappedRooms
    }

    return namespace;
}

/**
 * Maps a room from the database to a room object used in the application.
 */
async function mapRooms(rooms: Room[]): Promise<Room[]> {
    const mappedRooms: Room[] = [];

    for (let i = 0; i < rooms.length; i++) {
        const messages: Message[] = [];

        if (isCommonRoom(rooms[i].name)) {          // Only retrieve message history for the common rooms
            const roomMessages = await getMessagesByRoomId(rooms[i].id);
            messages.push(...roomMessages);
        }

        const room: Room = {
            id: rooms[i].id,
            name: rooms[i].name,
            namespaceId: rooms[i].namespaceId,
            private: rooms[i].private,
            members: rooms[i].members,
            history: [...messages]
        }

        mappedRooms.push(room);
    }

    return mappedRooms;
}

export async function getAllNamespaces(): Promise<Namespace[]> {
    const result: Namespace[] = [];

    try {
        const namespaces: Namespace[] = await NamespaceSchema.find({});

        for (let i = 0; i < namespaces.length; i++) {
            const namespace: Namespace = namespaces[i];
            const mappedNamespace = await mapNamespace(namespace.id, namespace);
            result.push(mappedNamespace);
        }
    } catch (error) {
        console.log(error);
    }

    return result;
}

/**
 * Send back namespaces with rooms, members and message history to a client when the client connects.
 */
export async function getDataForUser(userID: string): Promise<Namespace[]> {
    const namespaces: Namespace[] = [];

    try {
        const homeNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_HOME);
        if (homeNamespace) {
            const mappedNamespace = await mapNamespace(NAMESPACE_ID_HOME, homeNamespace);
            namespaces.push(mappedNamespace);
        }
        
        const dmNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_DM);
        if (dmNamespace) {
            const mappedNamespace = await mapNamespace(NAMESPACE_ID_DM, dmNamespace);
            mappedNamespace.rooms = [];         // In DM namespace a room is a conversation
            const conversations: string[] = await getConversationsByUserID(userID);

            for (let i = 0; i < conversations.length; i++) {
                const user: ChatUser | null = await getUserById(conversations[i]);

                if (user) {
                    const messages: Message[] = await getPrivateConversation(userID, user.id);
                    const room: Room = {
                        id: user.id,
                        name: user.username,
                        namespaceId: NAMESPACE_ID_DM,
                        private: true,
                        members: [user.id, userID],
                        history: [...messages]
                    }

                    mappedNamespace.rooms.push(room);
                }
            }

            namespaces.push(mappedNamespace);
        }

        const gamesNamespace: Namespace | null = await NamespaceSchema.findById(NAMESPACE_ID_GAMES);
        if (gamesNamespace) {
            const mappedNamespace = await mapNamespace(NAMESPACE_ID_GAMES, gamesNamespace);
            namespaces.push(mappedNamespace);
        }
    } catch (error) {
        console.log(error);
    }

    return namespaces;
}