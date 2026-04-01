import mongoose from 'mongoose';
import { publicMessageSchema } from './publicMessageSchema';

export const roomSchema = new mongoose.Schema({ 
    name: { 
        type: String,
        required: [true, "A room must have a name"],
        unique: true
    },
    namespaceId: {
        type: Number,
        required: [true, "A room must belong to a namespace"]
    },
    private: {
        type: Boolean,
        required: [true, "A room is either public or private"],
        default: false
    },
    members: [String],                  // A member string is a user's ID
    history: [publicMessageSchema]
});

const Room = mongoose.model('Room', roomSchema);

export default Room;