import crypto from "node:crypto";
import { Server } from "socket.io";
import { getUserByUsername, saveUser, setOnlineStatusForUser } from "../services/userService.js";
import type { ISocket } from "../interfaces.js";
import type{ TriviaUser } from "../../src/types.js";

const randomId = () => crypto.randomBytes(8).toString("hex");

/**
 * Check if someone is already connected with chosen username. Return an error if that is the case. Connected usernames must be unique.
 * The Socket instance is not actually connected when the middleware gets executed, which means that no disconnect event will be emitted 
 * if the connection eventually fails.
 */
export function checkUsername(io: Server): void {
    io.use(async (socket: ISocket, next) => {
        const username = socket.handshake.auth.username;
        socket.handshake.query.username = username;

        const user: TriviaUser | undefined = getUserByUsername(username);
        if (user && user.online) {        // A user is already online with that username
            return next(new Error("Username is not available. Choose a different username."));
        }

        if (user && !user.online) {        // A user already exists with that username, but is offline
            user.online = true;
            socket.userID = user.id;
            setOnlineStatusForUser(user.id, true);
            return next();
        }

        const userID: string = randomId();     // Generate unique ID for new user
        socket.userID = userID;
        const newUser: TriviaUser = {username, id: userID, online: true, avatar: "businessman_avatar.svg"};
        
        saveUser(newUser);
        next();
    });
}