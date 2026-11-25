import type { Server } from "socket.io";
import { ANSWER_RESPONSE, END_CALL, DENY_CALL, NAMESPACE_DM_ENDPOINT, NEW_ANSWER, NEW_OFFER, NEW_OFFER_AWAITING, NEW_OFFER_CANCELLED, RECEIVED_ICE_CANDIDATE_FROM_SERVER, SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, USER_UPDATED } from "../utils/constants";
import type { Offer, ChatUser } from "../../types";
import type { ISocket } from "../interfaces";
import { deleteOfferByOffererUsername, getOfferByAnswererUsername, getOfferByOffererUsername, saveOffer } from "../dao/webRtcDAO";
import { findUserByUsername, updateInCallStatus } from "../dao/userDAO";

/**
 * Initializes events related to WebRTC. WebRTC is only used in namespace 1 (DMs).
 */
export async function initializeWebRtcEvents(io: Server): Promise<void> {

   io.of(NAMESPACE_DM_ENDPOINT).on("connection", (socket: ISocket) => {
        const username = socket.username;
        if (!username) {
            socket.disconnect(true);
            return;
        }

        socket.on(NEW_OFFER, async (toUsername: unknown, video: unknown, newOffer: unknown) => {
            if (typeof toUsername !== "string" || typeof video !== "boolean" || typeof newOffer !== "object" || newOffer === null || toUsername === username) {
                return;
            }

            try {
                const callee: ChatUser = await findUserByUsername(toUsername);
                await deleteOfferByOffererUsername(username);           // Drop a stale offer from an earlier call
                const offer: Offer = {
                    offererUserName: username,
                    offer: newOffer as RTCSessionDescriptionInit,
                    offerIceCandidates: [],
                    answererUserName: callee.username,
                    answer: null,
                    answererIceCandidates: [],
                    video
                };
                await saveOffer(offer);

                updateUserStatus(io, username, true);
                socket.to(callee.id).emit(NEW_OFFER_AWAITING, offer);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(NEW_OFFER_CANCELLED, async (recipientUsername: unknown) => {
            if (typeof recipientUsername !== "string") {
                return;
            }

            try {
                await deleteOfferByOffererUsername(username);
                const recipient: ChatUser = await findUserByUsername(recipientUsername);
                socket.to(recipient.id).emit(NEW_OFFER_CANCELLED, username);
            } catch (error) {
                console.log(error);
            }

            updateUserStatus(io, username, false);
        });

        socket.on(END_CALL, () => {
            updateUserStatus(io, username, false);
        });

        socket.on(DENY_CALL, async (offererUsername: unknown) => {
            if (typeof offererUsername !== "string") {
                return;
            }

            try {
                const offer: Offer = await getOfferByOffererUsername(offererUsername);
                if (offer.answererUserName !== username) {
                    return;                                             // Only the callee can deny a call
                }

                await deleteOfferByOffererUsername(offererUsername);
                const offerer: ChatUser = await findUserByUsername(offererUsername);
                socket.to(offerer.id).emit(DENY_CALL);
                updateUserStatus(io, offererUsername, false);
            } catch (error) {
                console.log(error);
            }
        });

        socket.on(NEW_ANSWER, async (sentOffer: Offer, ackFunction: unknown) => {
            if (typeof ackFunction !== "function") {
                return;
            }

            try {
                if (typeof sentOffer?.offererUserName !== "string") {
                    return ackFunction([]);
                }

                const offer: Offer = await getOfferByOffererUsername(sentOffer.offererUserName);
                if (offer.answererUserName !== username) {
                    return ackFunction([]);                             // This offer is not addressed to this user
                }

                const offerer: ChatUser = await findUserByUsername(offer.offererUserName);
                ackFunction(offer.offerIceCandidates);

                offer.answer = sentOffer.answer;
                socket.to(offerer.id).emit(ANSWER_RESPONSE, offer);
                updateUserStatus(io, username, true);
            } catch (error) {
                console.log(error);
                ackFunction([]);
            }
        });

        socket.on(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, async (payload: { didIOffer?: boolean, iceCandidate?: RTCIceCandidate }) => {
            const { didIOffer, iceCandidate } = payload ?? {};
            if (!iceCandidate) {
                return;
            }

            try {
                if (didIOffer) {
                    const offer: Offer = await getOfferByOffererUsername(username);
                    offer.offerIceCandidates.push(iceCandidate);
                    await emitIceCandidate(socket, offer.answererUserName, iceCandidate);
                } else {
                    const offer: Offer = await getOfferByAnswererUsername(username);
                    await emitIceCandidate(socket, offer.offererUserName, iceCandidate);
                }
            } catch (error) {
                console.log(error);
            }
        });
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
        await updateInCallStatus(user.id, inCall);
        user.inCall = inCall;
        io.emit(USER_UPDATED, user);
    } catch (error) {
        console.log(error);
    }
}