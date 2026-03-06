import type { Server } from "socket.io";
import { getNamespaceByID } from "../services/namespaceService";
import { NAMESPACE_ID_DM } from "../utils";
import type { Namespace } from "../../types";
import type { ISocket } from "../interfaces";

/**
 * Initializes events related to WebRTC. WebRTC is only used in namespace 1 (DMs).
 */
export async function initializeWebRtcEvents(io: Server): Promise<void> {
    const namespace: Namespace = getNamespaceByID(NAMESPACE_ID_DM);

    io.of(namespace.endpoint).on("connection", async (socket: ISocket) => {
        console.log(socket);
    });
}