import type { Namespace, Room } from "../../types";
import { AppError } from "../errors/AppError";
import NamespaceSchema from "../schemas/namespaceSchema";
import { getRoomsInNamespace } from "./roomDAO";

export async function getAllNamespaces(): Promise<Namespace[]> {
    const mappedNamespaces: Namespace[] = [];
    try {
        const namespaces = await NamespaceSchema.find({});
        for (let i = 0; i < namespaces.length; i++) {
            const mappedNamespace = await mapDatabaseNamespace(namespaces[i]);
            mappedNamespaces.push(mappedNamespace);
        }
    } catch (error) {
        console.log(error);
    }

    return mappedNamespaces;
}

export async function findNamespaceById(namespaceID: number): Promise<Namespace> {
    const namespace = await NamespaceSchema.findById(namespaceID);
    if (namespace) {
        return mapDatabaseNamespace(namespace);
    }
    
    throw new AppError(`No namespace found with ID ${namespaceID}`, 404);
}

/**
 * Maps a namespace response from the database to a namespace object used in the application.
 */
async function mapDatabaseNamespace(source: any): Promise<Namespace> {
    const rooms: Room[] = await getRoomsInNamespace(source._id);

    const namespace: Namespace = {
        id: source._id,
        name: source.name,
        image: source.image,
        endpoint: source.endpoint,
        rooms: rooms
    }

    return namespace;
}