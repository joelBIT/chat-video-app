import mongoose from 'mongoose';

/**
 * Public messages are messages sent a room (and anyone in that room can read the message). 
 * A public message is always stored inside a room in a namespace.
 */
export const publicMessageSchema = new mongoose.Schema({
    from: {
        type: String,       // The user ID is used as identifier
        required: [true, "The message must be from a user"]
    },
    to: {
        type: String,       // The room ID is used as identifier
        required: [true, "The message must have a room ID as a recipient"]
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

export const PublicMessage = mongoose.model('PublicMessage', publicMessageSchema);