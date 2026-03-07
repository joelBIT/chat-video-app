import type { Namespace } from "../../types";
import namespaceStore from "../stores/namespaceStore";

/**
 * Add namespaces received from the server when the client connects. 
 * The state of the application is reset.
 */
export function addNamespaces(namespaces: Namespace[]): void {
    namespaces.forEach((namespace: Namespace) => {
        namespaceStore.saveNamespace(namespace);
    });
}

export function getNamespaces(): Namespace[] {
    return namespaceStore.getNamespaces();
}

export function isSelectedNamespace(namespaceID: number): boolean {
    return namespaceStore.isSelectedNamespace(namespaceID);
}

export function setSelectedNamespaceId(namespaceID: number): void {
    namespaceStore.setSelectedNamespaceId(namespaceID);
}