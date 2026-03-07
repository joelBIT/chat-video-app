import { NAMESPACE_ID_NONE, ROOM_ID_NONE } from "../../../socketApplication/utils";
import type { Namespace } from "../../types";

/**
 * Handles client data received from the server (e.g, namespaces, rooms, users).
 * IDs for selected room and namespace are stored and used to retrieve the most recent version of the objects 
 * from respective data structure.
 */
class InMemoryNamespaceStore {
    namespaces: Map<number, Namespace>;                // <namespaceID, Namespace>
    selectedNamespaceId: number;                       // The currently selected namespace ID
    selectedRoomId: string;                            // The currently selected room ID

    constructor() {
        this.namespaces = new Map();
        this.selectedNamespaceId = NAMESPACE_ID_NONE;        // This application only uses 3 multiplex namespaces (with IDs 0, 1, and 2).
        this.selectedRoomId = ROOM_ID_NONE;                  // Room IDs are long random strings (except for default rooms "0", "1", "2", and "3").
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

    isSelectedNamespace(namespaceID: number): boolean {
        return namespaceID === this.selectedNamespaceId;
    }
}

const namespaceStore = new InMemoryNamespaceStore();

export default namespaceStore;