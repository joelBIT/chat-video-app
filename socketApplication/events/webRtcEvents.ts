import type { Server } from "socket.io";
import { getNamespaceByID } from "../services/namespaceService";
import { ANSWER_RESPONSE, NAMESPACE_ID_DM, NEW_ANSWER, NEW_OFFER } from "../utils";
import type { Namespace, Offer } from "../../src/types";
import type { ISocket } from "../interfaces";
import { getUserByUsername } from "../services/userService";

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

        socket.on(NEW_ANSWER, (offerObject, ackFunction) => {
            console.log(offerObject);
            // Emit this answer (offerObj) back to CLIENT1. In order to do that, we need CLIENT1's socketid.
            const user = getUserByUsername(offerObject.offererUserName);
            if (!user) {
                console.log(`No user found for username ${offerObject.offererUserName}`);
                return;
            }

            const socketIdToAnswer = user.id;
            const offerToUpdate = offers.find(offer => offer.offererUserName === offerObject.offererUserName);
            if (!offerToUpdate) {
                console.log("No OfferToUpdate");
                return;
            }

            // Send back to the answerer all the iceCandidates we have already collected
            ackFunction(offerToUpdate.offerIceCandidates);

            // We find the offer to update so we can emit it
            offerToUpdate.answer = offerObject.answer;
            socket.to(socketIdToAnswer).emit(ANSWER_RESPONSE, offerToUpdate);
        });
    });
}