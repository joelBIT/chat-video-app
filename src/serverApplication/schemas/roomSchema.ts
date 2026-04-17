import mongoose from 'mongoose';
import { PasswordManager } from '../utils/passwordManager';

export const roomSchema = new mongoose.Schema({ 
    name: { 
        type: String,
        required: [true, "A room must have a name"],
        maxLength: [20, "A room name is limited to 20 characters"],
        minLength: [3, "A room name must consist of at least 3 characters"],
        unique: true,
        trim: true
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
    password: {
        type: String,
        required: [false, "A private room has a password"],
        default: ""
    },
    members: [String]                  // A member string is a user ID
});

roomSchema.pre('save', async function() {
    if (this.isModified('password') && this.get('password').length > 0) {
        this.password = await PasswordManager.toHash(this.get('password'));
    }
});

const Room = mongoose.model('Room', roomSchema);

export default Room;