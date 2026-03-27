import type { Server } from "socket.io";
import { getNamespaceByID } from "../services/namespaceService";
import { ANSWER_RESPONSE, END_CALL, NAMESPACE_ID_DM, NEW_ANSWER, NEW_OFFER, NEW_OFFER_AWAITING, NEW_OFFER_CANCELLED, RECEIVED_ICE_CANDIDATE_FROM_SERVER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, USER_UPDATED } from "../utils";
import type { Namespace, Offer, ChatUser } from "../../src/types";
import type { ISocket } from "../interfaces";
import { getUserByUsername, saveUser } from "../services/userService";

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

            updateUserStatus(io, fromUsername, true);

            socket.to(user.id).emit(NEW_OFFER_AWAITING, offer);
        });

        socket.on(NEW_OFFER_CANCELLED, (callerUsername: string) => {
            const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === callerUsername)
            if (!offer) {
                console.log(`No offer found for username ${callerUsername}`);
                return;
            }

            const remainingOffers: Offer[] = offers.filter((offer: Offer) => offer.offererUserName !== callerUsername);
            offers.length = 0;
            offers.push(...remainingOffers);

            const recipient: ChatUser | undefined = getUserByUsername(offer.answererUserName);
            if (!recipient) {
                console.log(`No user found for username ${offer.answererUserName}`);
                return;
            }

            socket.to(recipient.id).emit(NEW_OFFER_CANCELLED, callerUsername);
            updateUserStatus(io, callerUsername, false);
        });

        socket.on(END_CALL, (username: string) => {
            updateUserStatus(io, username, false);
        });

        socket.on(NEW_ANSWER, (sentOffer: Offer, ackFunction) => {
            // Emit this answer (sentOffer) back to CLIENT1. In order to do that, we need CLIENT1's id.
            const user: ChatUser | undefined = getUserByUsername(sentOffer.offererUserName);
            if (!user) {
                console.log(`No user found for username ${sentOffer.offererUserName}`);
                return;
            }

            const socketIdToAnswer: string = user.id;
            const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === sentOffer.offererUserName);
            if (!offer) {
                console.log("No offer to update");
                return;
            }

            // Send back to the answerer all the iceCandidates we have already collected
            ackFunction(offer.offerIceCandidates);

            // We find the offer to update so we can emit it
            offer.answer = sentOffer.answer;
            socket.to(socketIdToAnswer).emit(ANSWER_RESPONSE, offer);
            updateUserStatus(io, offer.answererUserName, true);
        });

        socket.on(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, iceCandidateObject => {
            const { didIOffer, iceUserName, iceCandidate } = iceCandidateObject;

            if (didIOffer) {
                // This ice candidate is coming from the offerer. Send to the answerer
                const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === iceUserName);
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
                const offer: Offer | undefined = offers.find((offer: Offer) => offer.answererUserName === iceUserName);
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

/**
 * Update if a user is in a call or not, and inform application users about the state change.
 */
function updateUserStatus(io: Server, username: string, inCall: boolean): void {
    const user: ChatUser | undefined = getUserByUsername(username);
    if (!user) {
        console.log(`No user found for username ${username}`);
        return;
    }

    user.inCall = inCall;
    saveUser(user);
    io.emit(USER_UPDATED, user);      // Inform users that this user is in a call.
}