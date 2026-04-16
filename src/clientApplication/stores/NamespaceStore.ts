import { NAMESPACE_ID_NONE, ROOM_ID_NONE } from "../../serverApplication/utils/constants";
import type { Namespace } from "../../types";

/**
 * Handles client data received from the server (e.g, namespaces, rooms, users).
 * IDs for selected room and namespace are stored and used to retrieve the most recent version of the objects 
 * from respective data structure.
 */
class InMemoryNamespaceStore {
    private namespaces: Map<number, Namespace>;                // <namespaceID, Namespace>
    private selectedNamespaceId: number;                       // The currently selected namespace ID
    private selectedRoomId: string;                            // The currently selected room ID
    private lastVisited: Map<string, number>;                  // <roomID, datetime> Keep track of when a room was last visited

    constructor() {
        this.namespaces = new Map();
        this.selectedNamespaceId = NAMESPACE_ID_NONE;        // This application only uses 3 multiplex namespaces (with IDs 0, 1, and 2).
        this.selectedRoomId = ROOM_ID_NONE;                  // Room IDs are long random strings (except for default rooms "0", "1", "2", and "3").
        this.lastVisited = new Map();
    }

    getNamespaces(): Namespace[] {
        return this.namespaces.values().toArray() ?? [];
    }

    getNamespace(namespaceID: number): Namespace {
        const namespace = this.namespaces.get(namespaceID);
        if (namespace) {
            return namespace;
        }
        
        throw new Error(`Could not find namespace with id ${namespaceID}`);
    }

    saveNamespace(namespace: Namespace): void {
        this.namespaces.set(namespace.id, namespace);
    }

    getSelectedNamespace(): Namespace | undefined {
        return this.namespaces.get(this.selectedNamespaceId);
    }

    setSelectedNamespaceId(namespaceID: number): void {
        this.selectedNamespaceId = namespaceID;
    }

    getSelectedNamespaceId(): number {
        return this.selectedNamespaceId;
    }

    isSelectedNamespace(namespaceID: number): boolean {
        return namespaceID === this.selectedNamespaceId;
    }

    getSelectedRoomId(): string {
        return this.selectedRoomId;
    }

    setSelectedRoomId(roomID: string): void {
        this.lastVisited.set(roomID, Date.now());       // Keep track of the user's most recent visit to the room
        this.selectedRoomId = roomID;
    }
}

const namespaceStore = new InMemoryNamespaceStore();

export default namespaceStore;