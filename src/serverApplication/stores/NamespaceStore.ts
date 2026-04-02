import type { Namespace } from "../../types";
import { isValidNamespace, NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME, ROOM_ID_ANNOUNCEMENTS, ROOM_ID_GENERAL, ROOM_ID_LOBBY, ROOM_ID_SUPPORT } from "../utils";

/**
 * Stores Namespaces with messages, rooms and members of each room. 
 * Messages for personal conversations are stored in messageStore. 
 * Application users are stored in userStore.
 */
class InMemoryNamespaceStore {
    private namespaces: Map<number, Namespace>;     // <namespaceID, namespace>

    constructor() {
        this.namespaces = new Map();
        this.namespaces.set(NAMESPACE_ID_HOME, {id: NAMESPACE_ID_HOME, name: "Home", image: "home.svg", endpoint: "/home", rooms: [{id: ROOM_ID_GENERAL, name: "General", namespaceId: 0, private: false, members: [], history: []}, {id: ROOM_ID_SUPPORT, name: "Support", namespaceId: 0, private: false, members: [], history: []}, {id: ROOM_ID_ANNOUNCEMENTS, name: "Announcements", namespaceId: 0, private: false, members: [], history: []}]});
        this.namespaces.set(NAMESPACE_ID_DM, {id: NAMESPACE_ID_DM, name: "DMs", image: "dm.svg", endpoint: "/dm", rooms: []});
        this.namespaces.set(NAMESPACE_ID_GAMES, {id: NAMESPACE_ID_GAMES, name: "Games", image: "games.svg", endpoint: "/games", rooms: [{id: ROOM_ID_LOBBY, name: "Lobby", namespaceId: 2, private: false, members: [], history: []}]} );
    }

    findNamespaceByID(namespaceID: number): Namespace {
        if (isValidNamespace(namespaceID)) {
            const namespace: Namespace | undefined = this.namespaces.get(namespaceID);
            if (namespace) {
                return namespace;
            }
        }
        throw new Error(`Could not retrieve namespace with id ${namespaceID}`);
    }

    saveNamespace(namespace: Namespace): void {
        this.namespaces.set(namespace.id, namespace);
    }
}

const namespaceStore = new InMemoryNamespaceStore();

export default namespaceStore;