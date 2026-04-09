import type { Server } from "socket.io";
import { ANSWER_RESPONSE, END_CALL, NAMESPACE_DM_ENDPOINT, NEW_ANSWER, NEW_OFFER, NEW_OFFER_AWAITING, NEW_OFFER_CANCELLED, RECEIVED_ICE_CANDIDATE_FROM_SERVER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, USER_UPDATED } from "../utils";
import type { Offer, ChatUser } from "../../types";
import type { ISocket } from "../interfaces";
import { getUserByUsername, updateUser } from "../services/userService";

const offers: Offer[] = [];

/**
 * Initializes events related to WebRTC. WebRTC is only used in namespace 1 (DMs).
 */
export async function initializeWebRtcEvents(io: Server): Promise<void> {

    io.of(NAMESPACE_DM_ENDPOINT).on("connection", async (socket: ISocket) => {
        socket.on(NEW_OFFER, async (fromUsername: string, toUsername: string, video: boolean, newOffer: RTCSessionDescriptionInit) => {
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

            try {
                const user: ChatUser = await getUserByUsername(toUsername);
                socket.to(user.id).emit(NEW_OFFER_AWAITING, offer);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(NEW_OFFER_CANCELLED, async (callerUsername: string) => {
            const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === callerUsername)
            if (!offer) {
                console.log(`No offer found for username ${callerUsername}`);
                return;
            }

            const remainingOffers: Offer[] = offers.filter((offer: Offer) => offer.offererUserName !== callerUsername);
            offers.length = 0;
            offers.push(...remainingOffers);

            try {
                const recipient: ChatUser = await getUserByUsername(offer.answererUserName);
                socket.to(recipient.id).emit(NEW_OFFER_CANCELLED, callerUsername);
            } catch (error) {
                console.log(error);
            }
            
            updateUserStatus(io, callerUsername, false);
        });

        socket.on(END_CALL, (username: string) => {
            updateUserStatus(io, username, false);
        });

        socket.on(NEW_ANSWER, async (sentOffer: Offer, ackFunction) => {
            // Emit this answer (sentOffer) back to CLIENT1. In order to do that, we need CLIENT1's id.
            const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === sentOffer.offererUserName);
            if (!offer) {
                console.log("No offer to update");
                return;
            }

            try {
                const user: ChatUser = await getUserByUsername(sentOffer.offererUserName);
                const socketIdToAnswer: string = user.id;

                // Send back to the answerer all the iceCandidates we have already collected
                ackFunction(offer.offerIceCandidates);

                // We find the offer to update so we can emit it
                offer.answer = sentOffer.answer;
                socket.to(socketIdToAnswer).emit(ANSWER_RESPONSE, offer);
                updateUserStatus(io, offer.answererUserName, true);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, async iceCandidateObject => {
            const { didIOffer, iceUserName, iceCandidate } = iceCandidateObject;

            if (didIOffer) {
                // This ice candidate is coming from the offerer. Send to the answerer
                const offer: Offer | undefined = offers.find((offer: Offer) => offer.offererUserName === iceUserName);
                if (offer) {
                    offer.offerIceCandidates.push(iceCandidate);
                    // 1. When the answerer answers, all existing ice candidates are sent
                    // 2. Any candidates that come in after the offer has been answered, will be passed through
                    if (offer.answererUserName) {
                        await emitIceCandidate(socket, offer.answererUserName, iceCandidate);
                    }
                }
            } else {
                // This ice candidate is coming from the answerer. Send to the offerer.
                const offer: Offer | undefined = offers.find((offer: Offer) => offer.answererUserName === iceUserName);
                if (offer) {
                    await emitIceCandidate(socket, offer.offererUserName, iceCandidate);
                }
            }
        })
    });
}

async function emitIceCandidate(socket: ISocket, username: string, iceCandidate: RTCLocalIceCandidateInit): Promise<void> {
    try {
        const user: ChatUser = await getUserByUsername(username);
        socket.to(user.id).emit(RECEIVED_ICE_CANDIDATE_FROM_SERVER, iceCandidate);
    } catch (error) {
        console.log(error);
    }
}

/**
 * Update if a user is in a call or not, and inform application users about the state change.
 */
async function updateUserStatus(io: Server, username: string, inCall: boolean): Promise<void> {
    try {
        const user: ChatUser = await getUserByUsername(username);
        user.inCall = inCall;
        updateUser(user);
        io.emit(USER_UPDATED, user);      // Inform users that this user is in a call.
    } catch (error) {
        console.log(error);
    }
}