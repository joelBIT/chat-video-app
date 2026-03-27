import { Socket } from "socket.io";

export interface ISocket extends Socket {
    userID?: string;
}