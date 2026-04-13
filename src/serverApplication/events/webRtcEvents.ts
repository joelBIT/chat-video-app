import type { Server } from "socket.io";
import { ANSWER_RESPONSE, END_CALL, DENY_CALL, NAMESPACE_DM_ENDPOINT, NEW_ANSWER, NEW_OFFER, NEW_OFFER_AWAITING, NEW_OFFER_CANCELLED, RECEIVED_ICE_CANDIDATE_FROM_SERVER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, USER_UPDATED } from "../utils/constants";
import type { Offer, ChatUser } from "../../types";
import type { ISocket } from "../interfaces";
import { deleteOfferByOffererUsername, getOfferByAnswererUsername, getOfferByOffererUsername, saveOffer } from "../dao/webRtcDAO";
import { findUserByUsername, updateUser } from "../dao/userDAO";

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
            saveOffer(offer);

            updateUserStatus(io, fromUsername, true);

            try {
                const user: ChatUser = await findUserByUsername(toUsername);
                socket.to(user.id).emit(NEW_OFFER_AWAITING, offer);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(NEW_OFFER_CANCELLED, async (callerUsername: string, recipientUsername: string) => {
            await deleteOfferByOffererUsername(callerUsername);

            try {
                const recipient: ChatUser = await findUserByUsername(recipientUsername);
                socket.to(recipient.id).emit(NEW_OFFER_CANCELLED, callerUsername);
            } catch (error) {
                console.log(error);
            }
            
            updateUserStatus(io, callerUsername, false);
        });

        socket.on(END_CALL, (username: string) => {
            updateUserStatus(io, username, false);
        });

        socket.on(DENY_CALL, async (offererUsername: string, denierUsername: string) => {
            await deleteOfferByOffererUsername(offererUsername);

            try {
                const offerer: ChatUser = await findUserByUsername(offererUsername);
                socket.to(offerer.id).emit(DENY_CALL, denierUsername);
            } catch (error) {
                console.log(error);
            }

            updateUserStatus(io, offererUsername, false);
        });

        socket.on(NEW_ANSWER, async (sentOffer: Offer, ackFunction) => {
            // Emit this answer (sentOffer) back to CLIENT1. In order to do that, we need CLIENT1's id.
            try {
                const offer: Offer = await getOfferByOffererUsername(sentOffer.offererUserName);
                const user: ChatUser = await findUserByUsername(sentOffer.offererUserName);
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
                try {
                    // This ice candidate is coming from the offerer. Send to the answerer
                    const offer: Offer = await getOfferByOffererUsername(iceUserName);
                    offer.offerIceCandidates.push(iceCandidate);

                    // 1. When the answerer answers, all existing ice candidates are sent
                    // 2. Any candidates that come in after the offer has been answered, will be passed through
                    if (offer.answererUserName) {
                        await emitIceCandidate(socket, offer.answererUserName, iceCandidate);
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    // This ice candidate is coming from the answerer. Send to the offerer.
                    const offer: Offer = await getOfferByAnswererUsername(iceUserName);
                    if (offer) {
                        await emitIceCandidate(socket, offer.offererUserName, iceCandidate);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
        })
    });
}

async function emitIceCandidate(socket: ISocket, username: string, iceCandidate: RTCLocalIceCandidateInit): Promise<void> {
    try {
        const user: ChatUser = await findUserByUsername(username);
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
        const user: ChatUser = await findUserByUsername(username);
        user.inCall = inCall;
        updateUser(user);
        io.emit(USER_UPDATED, user);      // Inform users that this user is in a call.
    } catch (error) {
        console.log(error);
    }
}