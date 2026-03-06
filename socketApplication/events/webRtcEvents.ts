import type { Server } from "socket.io";
import { getNamespaceByID } from "../services/namespaceService";
import { NAMESPACE_ID_DM, NEW_OFFER } from "../utils";
import type { Namespace, Offer } from "../../src/types";
import type { ISocket } from "../interfaces";

const offers: Offer[] = [];

/**
 * Initializes events related to WebRTC. WebRTC is only used in namespace 1 (DMs).
 */
export async function initializeWebRtcEvents(io: Server): Promise<void> {
    const namespace: Namespace = getNamespaceByID(NAMESPACE_ID_DM);

    io.of(namespace.endpoint).on("connection", async (socket: ISocket) => {
        console.log(socket);

        socket.on(NEW_OFFER, (fromUsername: string, toUsername: string, newOffer: RTCSessionDescriptionInit) => {
            offers.push({
                offererUserName: fromUsername,
                offer: newOffer,
                offerIceCandidates: [],
                answererUserName: toUsername,
                answer: null,
                answererIceCandidates: []
            });
        });
    });
}