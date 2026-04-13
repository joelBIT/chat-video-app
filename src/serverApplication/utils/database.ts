import Namespace from "../schemas/namespaceSchema";
import Room from "../schemas/roomSchema";
import User from "../schemas/userSchema";
import { NAMESPACE_DM_ENDPOINT, NAMESPACE_GAMES_ENDPOINT, NAMESPACE_HOME_ENDPOINT, NAMESPACE_ID_DM, NAMESPACE_ID_GAMES, NAMESPACE_ID_HOME, ROOM_NAME_ANNOUNCEMENTS, ROOM_NAME_GENERAL, ROOM_NAME_LOBBY, ROOM_NAME_SUPPORT } from "./constants";

/**
 * Create the 3 common namespaces and the 4 common rooms if they do not exist.
 */
export async function createDatabaseCollections(): Promise<void> {
    try {
        let exists = await Namespace.exists({ name: 'Home' });
        if (!exists) {
            await Namespace.create({
                _id: NAMESPACE_ID_HOME,
                name: 'Home',
                endpoint: NAMESPACE_HOME_ENDPOINT,
                image: 'home.svg'
            });
        }

        let roomExists = await Room.exists({ name: ROOM_NAME_GENERAL });
        if (!roomExists) {
            await Room.create({
                name: ROOM_NAME_GENERAL,
                namespaceId: NAMESPACE_ID_HOME
            });
        }

        roomExists = await Room.exists({ name: ROOM_NAME_SUPPORT });
        if (!roomExists) {
            await Room.create({
                name: ROOM_NAME_SUPPORT,
                namespaceId: NAMESPACE_ID_HOME
            });
        }

        roomExists = await Room.exists({ name: ROOM_NAME_ANNOUNCEMENTS });
        if (!roomExists) {
            await Room.create({
                name: ROOM_NAME_ANNOUNCEMENTS,
                namespaceId: NAMESPACE_ID_HOME
            });
        }

        exists = await Namespace.exists({ name: 'DMs' });
        if (!exists) {
            await Namespace.create({
                _id: NAMESPACE_ID_DM,
                name: 'DMs',
                endpoint: NAMESPACE_DM_ENDPOINT,
                image: 'dm.svg'
            });
        }

        exists = await Namespace.exists({ name: 'Games' });
        if (!exists) {
            await Namespace.create({
                _id: NAMESPACE_ID_GAMES,
                name: 'Games',
                endpoint: NAMESPACE_GAMES_ENDPOINT,
                image: 'games.svg'
            });
        }

        roomExists = await Room.exists({ name: ROOM_NAME_LOBBY });
        if (!roomExists) {
            await Room.create({
                name: ROOM_NAME_LOBBY,
                namespaceId: NAMESPACE_ID_GAMES
            });
        }
    } catch (error) {
        console.log(error);
    }
}


/**
 * Set all users as offline and as not 'inCall' if the server restarts for some reason.
 */
export async function setAllUsersAsOffline(): Promise<void> {
    try {
        await User.updateMany({}, { online: false, inCall: false });
    } catch (error) {
        console.log(error);
    }
}