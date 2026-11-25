import { Server } from "socket.io";
import express from 'express';
import type { ISocket } from "../interfaces";
import { AppError } from "../errors/AppError";
import { isCorrectPassword } from "../services/userService";
import { verifyToken } from "../utils/sessionToken";
import { findUserById, findUserByUsername, updateOnlineStatus } from "../dao/userDAO";
import type { ChatUser } from "../../types";
import { NAMESPACE_DM_ENDPOINT, NAMESPACE_GAMES_ENDPOINT, NAMESPACE_HOME_ENDPOINT } from "../utils/constants";

/**
 * Every custom namespace requires the signed token that the server sent to the client after a successful login.
 * The user ID comes from the token, never from anything the client claims (e.g. the query string).
 */
export function authenticateNamespaces(io: Server): void {
    [NAMESPACE_HOME_ENDPOINT, NAMESPACE_DM_ENDPOINT, NAMESPACE_GAMES_ENDPOINT].forEach((endpoint: string) => {
        io.of(endpoint).use(async (socket: ISocket, next) => {
            const userID = verifyToken(socket.handshake.auth?.token);
            if (!userID) {
                return next(new Error("Not authenticated."));
            }

            try {
                await findUserById(userID);         // The user must still exist
            } catch {
                return next(new Error("Not authenticated."));
            }

            socket.userID = userID;
            next();
        });
    });
}

/**
 * Check if password matches username. Return an error if that is not the case. Connected usernames must be unique.
 * The Socket instance is not actually connected when the middleware gets executed, which means that no disconnect event will be emitted 
 * if the connection eventually fails.
 */
export function login(io: Server): void {
    io.use(async (socket: ISocket, next) => {
        const username = socket.handshake.auth.username;
        const password = socket.handshake.auth.password;

        const isValidCredentials: boolean = await isCorrectPassword(username, password);
        if (!isValidCredentials) {
            return next(new Error("Invalid credentials."));
        }

        try {
            const user: ChatUser = await findUserByUsername(username);
            if (user.online) {
                return next(new Error(`${user.username} is already online.`));
            }

            socket.userID = user.id;                    // Set permanent user ID on the socket (since socket IDs change every connection)
            await updateOnlineStatus(username, true);
            return next();
        } catch (error) {
            console.log(error);
        }

        return next(new Error(`Could not sign in ${username}.`));
    });
}

/**
 * Check if POST body contains required username and password properties. Only execute the registerUser function if properties exist.
 */
export function checkBody(req: express.Request, _res: express.Response, next: express.NextFunction): void {
    if (!req.body.username || !req.body.password) {
        next(new AppError("Username and password must be supplied.", 400));
    }

    next();
}