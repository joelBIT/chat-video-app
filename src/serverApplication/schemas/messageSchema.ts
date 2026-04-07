import mongoose from 'mongoose';

/**
 * Public messages are messages sent to a room (and anyone in that room can read the message).
 */
export const messageSchema = new mongoose.Schema({
    from: {
        type: String,       // The user ID of the sender is used as identifier
        required: [true, "The message must be sent from a user and have a user ID"]
    },
    to: {
        type: String,       // The room ID (or recipient user ID) is used as identifier
        required: [true, "The message must have a recipient ID"]
    },
    public: {
        type: Boolean,
        required: [true, "True if the message is sent in a room, false if sent in a private conversation (DM)"],
        default: true
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

export const MessageModel = mongoose.model('Message', messageSchema);