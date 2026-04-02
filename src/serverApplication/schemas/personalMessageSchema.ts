import mongoose from 'mongoose';

/**
 * Personal messages are messages sent between two users in a private conversation (DM).
 */
export const personalMessageSchema = new mongoose.Schema({
    from: {
        type: String,       // The sender ID is used as identifier
        required: [true, "A message must have a sender"]
    },
    to: {
        type: String,       // The recipient ID is used as identifier
        required: [true, "A message must have a recipient"]
    },
    text: {
        type: String,
        required: [true, "Message must contain text"]
    },
    date: {
        type: Number,
        required: [true, "Must know when the message was sent from the client"]
    }
}, { timestamps: true });

const PersonalMessage = mongoose.model('PersonalMessage', personalMessageSchema);

export default PersonalMessage;