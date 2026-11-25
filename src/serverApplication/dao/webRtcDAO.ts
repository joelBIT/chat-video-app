import OfferSchema from "../schemas/offerSchema";
import type { Offer } from "../../types";
import { AppError } from "../errors/AppError";

const NEWEST_FIRST = { createdAt: -1 } as const;

export async function saveOffer(offer: Offer): Promise<void> {
    await OfferSchema.create(offer);            // Errors propagate: do not announce an offer that was not saved
}

export async function getOfferByOffererUsername(offererUserName: string): Promise<Offer> {
    const offer = await OfferSchema.findOne({ offererUserName }).sort(NEWEST_FIRST);
    if (offer) {
        return mapOffer(offer);
    }

    throw new AppError(`No offerer with username ${offererUserName} found`, 404);
}

/**
 * The newest offer where the user is either the caller or the callee.
 */
export async function findOfferByParticipant(username: string): Promise<Offer | null> {
    const offer = await OfferSchema.findOne({
        $or: [{ offererUserName: username }, { answererUserName: username }]
    }).sort(NEWEST_FIRST);

    return offer ? mapOffer(offer) : null;
}

export async function deleteOffersByParticipant(username: string): Promise<void> {
    await OfferSchema.deleteMany({
        $or: [{ offererUserName: username }, { answererUserName: username }]
    });
}

/**
 * Atomically stores the answer, but only if the offer is addressed to answererUserName and is not answered yet.
 * Returns the offer as it was BEFORE the update, i.e. with the ICE candidates collected up to this moment.
 * Candidates pushed afterwards see the answer and are forwarded live instead.
 */
export async function saveAnswer(offererUserName: string, answererUserName: string, answer: RTCSessionDescriptionInit): Promise<Offer | null> {
    const previous = await OfferSchema.findOneAndUpdate(
        { offererUserName, answererUserName, answer: null },
        { $set: { answer } },
        { sort: NEWEST_FIRST, returnDocument: "before" }
    );

    return previous ? mapOffer(previous) : null;
}

/**
 * Atomically appends a candidate from the caller. Returns the offer after the update (null if none exists).
 */
export async function addOfferIceCandidate(offererUserName: string, candidate: RTCIceCandidateInit): Promise<Offer | null> {
    const updated = await OfferSchema.findOneAndUpdate(
        { offererUserName },
        { $push: { offerIceCandidates: candidate } },
        { sort: NEWEST_FIRST, returnDocument: "after" }
    );

    return updated ? mapOffer(updated) : null;
}

export async function addAnswererIceCandidate(answererUserName: string, candidate: RTCIceCandidateInit): Promise<Offer | null> {
    const updated = await OfferSchema.findOneAndUpdate(
        { answererUserName },
        { $push: { answererIceCandidates: candidate } },
        { sort: NEWEST_FIRST, returnDocument: "after" }
    );

    return updated ? mapOffer(updated) : null;
}

function mapOffer(offer: any): Offer {
    return {
        offererUserName: offer.offererUserName,
        offer: offer.offer,
        offerIceCandidates: [...offer.offerIceCandidates],
        answererUserName: offer.answererUserName,
        answer: offer.answer ?? null,
        answererIceCandidates: [...offer.answererIceCandidates],
        video: offer.video
    };
}