import mongoose from 'mongoose';

export const offerSchema = new mongoose.Schema({
    offer: {
        type: Object,               // RTCSessionDescriptionInit
        required: [true, "An offer must exist when initiating an offer."]
    },
    offerIceCandidates: [],         // RTCIceCandidate[]
    offererUserName: {
        type: String,
        required: [true, "An offer must have a user that initiated the offer."],
        trim: true
    },
    answererIceCandidates: [],      // RTCIceCandidate[]
    answererUserName: {
        type: String,
        trim: true
    },
    answer: Object,                 // RTCSessionDescriptionInit | null
    video: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Offer = mongoose.model('Offer', offerSchema);

export default Offer;