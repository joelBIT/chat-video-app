import type { ChatUser, Message, Namespace } from "../../types";
import { NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME } from "../utils/constants";
import { findUserById } from "../dao/userDAO";
import { getConversationsByUserID } from "../dao/messageDAO";
import { getPrivateConversation } from "./messageService";
import { findNamespaceById } from "../dao/namespaceDAO";
import { addMessageHistoryToRooms } from "./roomService";

/**
 * Send back namespaces with rooms, members and message history to a client when the client connects.
 */
export async function getDataForUser(userID: string): Promise<Namespace[]> {
    const namespaces: Namespace[] = [];

    try {
        const homeNamespace: Namespace = await findNamespaceById(NAMESPACE_ID_HOME);
        let roomsWithHistory = await addMessageHistoryToRooms(homeNamespace.rooms, userID);
        homeNamespace.rooms = [];
        homeNamespace.rooms.push(...roomsWithHistory);
        namespaces.push(homeNamespace);
        
        const dmNamespace: Namespace = await findNamespaceById(NAMESPACE_ID_DM);
        dmNamespace.rooms = [];         // In DM namespace a room is a conversation

        const conversations: string[] = await getConversationsByUserID(userID).catch((error) => { console.log(error); return []; });
        for (const otherUserID of conversations) {
            try {
                const user: ChatUser = await findUserById(otherUserID);
                const messages: Message[] = await getPrivateConversation(userID, user.id);
                dmNamespace.rooms.push({
                    id: user.id,
                    name: user.username,
                    namespaceId: NAMESPACE_ID_DM,
                    private: true,
                    members: [user.id, userID],
                    history: [...messages]
                });
            } catch (error) {
                console.log(error);
            }
        }

        namespaces.push(dmNamespace);

        const gamesNamespace: Namespace = await findNamespaceById(NAMESPACE_ID_GAMES);
        roomsWithHistory = await addMessageHistoryToRooms(gamesNamespace.rooms, userID);
        gamesNamespace.rooms = [];
        gamesNamespace.rooms.push(...roomsWithHistory);
        namespaces.push(gamesNamespace);
    } catch (error) {
        console.log(error);
    }

    return namespaces;
}