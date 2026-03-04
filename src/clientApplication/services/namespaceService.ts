import { Namespace } from "@/app/_types/types";
import namespaceStore from "../stores/namespaceStore";
import { NamespaceID } from "@/socketApplication/enums";

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

export function isSelectedNamespace(namespaceID: NamespaceID): boolean {
    return namespaceStore.isSelectedNamespace(namespaceID);
}

export function setSelectedNamespaceId(namespaceID: NamespaceID): void {
    namespaceStore.setSelectedNamespaceId(namespaceID);
}