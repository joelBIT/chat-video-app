import OfferSchema from "../schemas/offerSchema";
import type { Offer } from "../../types";
import { AppError } from "../errors/AppError";

export async function saveOffer(offer: Offer): Promise<void> {
    try {
        await OfferSchema.create(offer);
    } catch (error) {
        console.log(error);
    }
}

export async function getOfferByOffererUsername(offererUserName: string): Promise<Offer> {
    const offer: Offer | null = await OfferSchema.findOne({ offererUserName: offererUserName });

    if (offer) {
        return mapOffer(offer);
    }

    throw new AppError(`No offerer with username ${offererUserName} found`, 404);
}

export async function getOfferByAnswererUsername(answererUserName: string): Promise<Offer> {
    const offer: Offer | null = await OfferSchema.findOne({ answererUserName: answererUserName });

    if (offer) {
        return mapOffer(offer);
    }

    throw new AppError(`No answerer with username ${answererUserName} found`, 404);
}

function mapOffer(offer: Offer): Offer {
    const createdOffer: Offer = {
        offererUserName: offer.offererUserName,
        offer: offer.offer,
        offerIceCandidates: offer.offerIceCandidates,
        answererUserName: offer.answererUserName,
        answer: offer.answer,
        answererIceCandidates: offer.answererIceCandidates,
        video: offer.video
    }

    return createdOffer;
}

export async function deleteOfferByOffererUsername(offererUserName: string): Promise<void> {
    try {
        await OfferSchema.deleteOne({ offererUserName });
    } catch (error) {
        console.log(error);
    }
}