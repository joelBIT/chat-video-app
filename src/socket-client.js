import { io } from "socket.io-client";

/**
 * The autoConnect=false prevents the Socket.IO client from opening a connection to the server right away.
 * Thus, you will need to call socket.connect() to make the Socket.IO client connect.
 * This can be useful for example when the user must provide some kind of credentials before connecting.
 * 
 * Always join the main namespace, because that is where the client gets the other namespaces from.
 */
export const socket = io({ autoConnect: false, query: { username: ''} });

// Contains the multiplex sockets for namespaces "General", "DM", and "Games". The list index corresponds to the namespace ID.
export const multiplexSockets = [];