import type { Server } from "socket.io";
import { ANSWER_RESPONSE, DENY_CALL, END_CALL, NAMESPACE_DM_ENDPOINT, NEW_ANSWER, NEW_OFFER, 
    NEW_OFFER_AWAITING, NEW_OFFER_CANCELLED, RECEIVED_ICE_CANDIDATE_FROM_SERVER, 
    SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, USER_UPDATED } from "../utils/constants";
import type { ChatUser, Offer } from "../../types";
import type { ISocket } from "../interfaces";
import { addAnswererIceCandidate, addOfferIceCandidate, deleteOffersByParticipant, 
    findOfferByParticipant, getOfferByOffererUsername, saveAnswer, saveOffer } from "../dao/webRtcDAO";
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

        // This socket's events run strictly in the order they arrived. The handlers are async, and an ICE candidate
        // must not be processed before the offer (or answer) it belongs to has been saved.
        let queue: Promise<void> = Promise.resolve();
        function on(event: string, handler: (...args: unknown[]) => Promise<void>): void {
            socket.on(event, (...args: unknown[]) => {
                queue = queue.then(() => handler(...args)).catch((error) => console.log(error));
            });
        }

        on(NEW_OFFER, async (toUsername: unknown, video: unknown, newOffer: unknown) => {
            const description = toSessionDescription(newOffer, "offer");
            if (typeof toUsername !== "string" || typeof video !== "boolean" || !description || toUsername === username) {
                return;
            }

            const callee: ChatUser = await findUserByUsername(toUsername);
            await deleteOffersByParticipant(username);          // Drop leftovers from earlier calls

            const offer: Offer = {
                offererUserName: username,
                offer: description,
                offerIceCandidates: [],
                answererUserName: callee.username,
                answer: null,
                answererIceCandidates: [],
                video
            };
            await saveOffer(offer);

            updateUserStatus(io, username, true);
            io.of(NAMESPACE_DM_ENDPOINT).to(callee.id).emit(NEW_OFFER_AWAITING, offer);
        });

        on(NEW_OFFER_CANCELLED, async (recipientUsername: unknown) => {
            if (typeof recipientUsername !== "string") {
                return;
            }

            try {
                await deleteOffersByParticipant(username);
                const recipient: ChatUser = await findUserByUsername(recipientUsername);
                io.of(NAMESPACE_DM_ENDPOINT).to(recipient.id).emit(NEW_OFFER_CANCELLED, username);
            } finally {
                await updateUserStatus(io, username, false);
            }
        });

        on(DENY_CALL, async (offererUsername: unknown) => {
            if (typeof offererUsername !== "string") {
                return;
            }

            const offer: Offer = await getOfferByOffererUsername(offererUsername);
            if (offer.answererUserName !== username) {
                return;                                     // Only the callee can deny a call
            }

            await deleteOffersByParticipant(offererUsername);
            const offerer: ChatUser = await findUserByUsername(offererUsername);
            io.of(NAMESPACE_DM_ENDPOINT).to(offerer.id).emit(DENY_CALL);
            await updateUserStatus(io, offererUsername, false);
        });

        on(NEW_ANSWER, async (sentOffer: unknown, ackFunction: unknown) => {
            if (typeof ackFunction !== "function") {
                return;
            }

            const { offererUserName, answer: sentAnswer } = (sentOffer ?? {}) as Partial<Offer>;
            const answer = toSessionDescription(sentAnswer, "answer");
            if (typeof offererUserName !== "string" || !answer) {
                return ackFunction([]);
            }

            // Only the callee of this offer can answer it, and only once.
            const previous: Offer | null = await saveAnswer(offererUserName, username, answer);
            if (!previous) {
                return ackFunction([]);
            }

            // The callee gets the caller's candidates collected so far...
            ackFunction(previous.offerIceCandidates);

            // ...and the caller gets the answer together with the callee's candidates collected so far.
            const offerer: ChatUser = await findUserByUsername(previous.offererUserName);
            io.of(NAMESPACE_DM_ENDPOINT).to(offerer.id).emit(ANSWER_RESPONSE, { ...previous, answer });
            await updateUserStatus(io, username, true);
        });

        on(SEND_ICE_CANDIDATE_TO_SIGNALING_SERVER, async (payload: unknown) => {
            const { didIOffer, iceCandidate: rawCandidate } = (payload ?? {}) as { didIOffer?: unknown, iceCandidate?: unknown };
            const iceCandidate = toIceCandidate(rawCandidate);
            if (!iceCandidate) {
                return;
            }

            const fromOfferer: boolean = didIOffer === true;
            const offer: Offer | null = fromOfferer
                ? await addOfferIceCandidate(username, iceCandidate)
                : await addAnswererIceCandidate(username, iceCandidate);

            // Not answered yet: the candidate is stored and travels with the answer / the NEW_ANSWER ack.
            if (!offer?.answer) {
                return;
            }

            const peerUsername: string = fromOfferer ? offer.answererUserName : offer.offererUserName;
            const peer: ChatUser = await findUserByUsername(peerUsername);
            io.of(NAMESPACE_DM_ENDPOINT).to(peer.id).emit(RECEIVED_ICE_CANDIDATE_FROM_SERVER, iceCandidate);
        });

        on(END_CALL, async () => {
            await endCall(io, username, true);
        });

        on("disconnect", async () => {
            await endCall(io, username, false);         // A closed tab or lost connection ends the call too
        });
    });
}

/**
 * Ends the call the user is part of: tells the other party, deletes the offer and clears both users' "in a call" status.
 * With alwaysReset the user's own status is cleared even if no offer exists.
 */
async function endCall(io: Server, username: string, alwaysReset: boolean): Promise<void> {
    const offer: Offer | null = await findOfferByParticipant(username);

    if (offer) {
        const peerUsername: string = offer.offererUserName === username ? offer.answererUserName : offer.offererUserName;
        await deleteOffersByParticipant(username);

        try {
            const peer: ChatUser = await findUserByUsername(peerUsername);
            io.of(NAMESPACE_DM_ENDPOINT).to(peer.id).emit(END_CALL);
        } catch (error) {
            console.log(error);
        }

        await updateUserStatus(io, peerUsername, false);
    }

    if (offer || alwaysReset) {
        await updateUserStatus(io, username, false);
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

function toIceCandidate(value: unknown): RTCIceCandidateInit | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const { candidate, sdpMid, sdpMLineIndex, usernameFragment } = value as Record<string, unknown>;
    if (typeof candidate !== "string" || candidate.length >= 2000) {
        return null;
    }

    return {
        candidate,
        sdpMid: typeof sdpMid === "string" ? sdpMid : null,
        sdpMLineIndex: typeof sdpMLineIndex === "number" ? sdpMLineIndex : null,
        usernameFragment: typeof usernameFragment === "string" ? usernameFragment : null
    };
}

function toSessionDescription(value: unknown, type: "offer" | "answer"): RTCSessionDescriptionInit | null {
    if (typeof value !== "object" || value === null) {
        return null;
    }

    const { type: actualType, sdp } = value as Record<string, unknown>;
    if (actualType !== type || typeof sdp !== "string" || sdp.length > 20_000) {
        return null;
    }

    return { type, sdp };
}