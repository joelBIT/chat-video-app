import mongoose from 'mongoose';
import { userSchema } from './userSchema';

/**
 * Public messages are messages sent a room (and anyone in that room can read the message). 
 * A public message is always stored inside a room in a namespace.
 */
export const publicMessageSchema = new mongoose.Schema({
    from: {
        type: userSchema,
        required: [true, "The message must be from a user"]
    },
    text: {
        type: String,
        required: [true, "Message must contain text"]
    },
    date: {
        type: Number,
        required: [true, "Must know when the message was sent"]
    }
}, { timestamps: true });

const PublicMessage = mongoose.model('PublicMessage', publicMessageSchema);

export default PublicMessage;