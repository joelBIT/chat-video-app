import type { Server } from "socket.io";
import { getNamespaceByID } from "../services/namespaceService";
import { ANSWER_RESPONSE, NAMESPACE_ID_DM, NEW_ANSWER, NEW_OFFER, NEW_OFFER_AWAITING, RECEIVED_ICE_CANDIDATE_FROM_SERVER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER } from "../utils";
import type { Namespace, Offer, ChatUser } from "../../src/types";
import type { ISocket } from "../interfaces";
import { getUserByUsername } from "../services/userService";

const offers: Offer[] = [];

/**
 * Initializes events related to WebRTC. WebRTC is only used in namespace 1 (DMs).
 */
export async function initializeWebRtcEvents(io: Server): Promise<void> {
    const namespace: Namespace = getNamespaceByID(NAMESPACE_ID_DM);

    io.of(namespace.endpoint).on("connection", async (socket: ISocket) => {
        socket.on(NEW_OFFER, (fromUsername: string, toUsername: string, video: boolean, newOffer: RTCSessionDescriptionInit) => {
            const user: ChatUser | undefined = getUserByUsername(toUsername);
            if (!user) {
                console.log(`No user found for username ${toUsername}`);
                return;
            }

            const offer: Offer = {
                offererUserName: fromUsername,
                offer: newOffer,
                offerIceCandidates: [],
                answererUserName: toUsername,
                answer: null,
                answererIceCandidates: [],
                video
            };
            offers.push(offer);

            socket.to(user.id).emit(NEW_OFFER_AWAITING, offer);
        });

        socket.on(NEW_ANSWER, (offerObject: Offer, ackFunction) => {
            // Emit this answer (offerObject) back to CLIENT1. In order to do that, we need CLIENT1's id.
            const user: ChatUser | undefined = getUserByUsername(offerObject.offererUserName);
            if (!user) {
                console.log(`No user found for username ${offerObject.offererUserName}`);
                return;
            }

            const socketIdToAnswer: string = user.id;
            const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === offerObject.offererUserName);
            if (!offer) {
                console.log("No offer to update");
                return;
            }

            // Send back to the answerer all the iceCandidates we have already collected
            ackFunction(offer.offerIceCandidates);

            // We find the offer to update so we can emit it
            offer.answer = offerObject.answer;
            socket.to(socketIdToAnswer).emit(ANSWER_RESPONSE, offer);
        });

        socket.on(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, iceCandidateObject => {
            const { didIOffer, iceUserName, iceCandidate } = iceCandidateObject;

            if (didIOffer) {
                // This ice candidate is coming from the offerer. Send to the answerer
                const offer: Offer | undefined = offers.find(offer => offer.offererUserName === iceUserName);
                if (offer) {
                    offer.offerIceCandidates.push(iceCandidate);
                    // 1. When the answerer answers, all existing ice candidates are sent
                    // 2. Any candidates that come in after the offer has been answered, will be passed through
                    if (offer.answererUserName) {
                        const user: ChatUser | undefined = getUserByUsername(offer.answererUserName);
                        if (user) {
                            socket.to(user.id).emit(RECEIVED_ICE_CANDIDATE_FROM_SERVER, iceCandidate);
                        } else {
                            console.log("Ice candidate recieved but could not find answerer");
                        }
                    }
                }
            } else {
                // This ice candidate is coming from the answerer. Send to the offerer.
                const offer: Offer | undefined = offers.find(offer => offer.answererUserName === iceUserName);
                if (offer) {
                    const user: ChatUser | undefined = getUserByUsername(offer.offererUserName);
                    if (user) {
                        socket.to(user.id).emit(RECEIVED_ICE_CANDIDATE_FROM_SERVER, iceCandidate);
                    } else {
                        console.log("Ice candidate recieved but could not find offerer");
                    }
                }
            }
        })
    });
}