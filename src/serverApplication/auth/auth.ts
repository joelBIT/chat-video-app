import { Server } from "socket.io";
import type { ISocket } from "../interfaces.js";
import User from "../schemas/userSchema.js";

/**
 * Check if password matches username. Return an error if that is not the case. Connected usernames must be unique.
 * The Socket instance is not actually connected when the middleware gets executed, which means that no disconnect event will be emitted 
 * if the connection eventually fails.
 */
export function login(io: Server): void {
    io.use(async (socket: ISocket, next) => {
        const username = socket.handshake.auth.username;
        const password = socket.handshake.auth.password;
        socket.handshake.query.username = username;

        const user = await User.findOne({username});
        if (user) {
            if (password != user.password) {
                return next(new Error(`Wrong password.`));
            }

            if (user.online) {
                return next(new Error(`User is already online.`));
            }

            socket.userID = user.id;                    // Set permanent user ID on the socket (since socket IDs change every connection)
            await User.updateOne({ username }, { online: true });
            return next();
        }

        return next(new Error(`Could not sign in ${username}.`));
    });
}