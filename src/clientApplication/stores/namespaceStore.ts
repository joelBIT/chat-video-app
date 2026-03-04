'use client';

import { Namespace } from "@/app/_types/types";
import { NamespaceID, RoomID } from "@/socketApplication/enums";

/* abstract */ class NamespaceStore {
    getNamespaces() {};
    getNamespace(namespaceID: NamespaceID) {};
    saveNamespace(namespace: Namespace) {};
    getSelectedNamespace() {};
    setSelectedNamespaceId(namespaceID: NamespaceID) {};
    isSelectedNamespace(namespaceID: NamespaceID) {};
}

/**
 * Handles client data received from the server (e.g, namespaces, rooms, users).
 * IDs for selected room and namespace are stored and used to retrieve the most recent version of the objects 
 * from respective data structure.
 */
class InMemoryNamespaceStore extends NamespaceStore {
    namespaces: Map<number, Namespace>;                      // <namespaceID, Namespace>
    selectedNamespaceId: NamespaceID;                       // The currently selected namespace ID
    selectedRoomId: string;                                 // The currently selected room ID

    constructor() {
        super();
        this.namespaces = new Map();
        this.selectedNamespaceId = NamespaceID.NONE;        // This application only uses 3 multiplex namespaces (with IDs 0, 1, and 2).
        this.selectedRoomId = RoomID.NONE;                  // Room IDs are long random strings (except for default rooms "0", "1", "2", and "3").
    }

    getNamespaces(): Namespace[] {
        return this.namespaces.values().toArray() ?? [];
    }

    getNamespace(namespaceID: NamespaceID): Namespace {
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

    setSelectedNamespaceId(namespaceID: NamespaceID): void {
        this.selectedNamespaceId = namespaceID;
    }

    isSelectedNamespace(namespaceID: NamespaceID): boolean {
        return namespaceID === this.selectedNamespaceId;
    }
}

const namespaceStore = new InMemoryNamespaceStore();

export default namespaceStore;