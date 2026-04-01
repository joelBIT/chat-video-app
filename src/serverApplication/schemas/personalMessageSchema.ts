import mongoose from 'mongoose';
import { userSchema } from './userSchema';

/**
 * Personal messages are messages sent between two users in a private conversation (DM).
 */
export const personalMessageSchema = new mongoose.Schema({
    from: {
        type: userSchema,
        required: [true, "The message must have a sender"]
    },
    to: {
        type: userSchema,
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