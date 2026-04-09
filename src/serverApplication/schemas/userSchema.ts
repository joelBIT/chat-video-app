import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: [true, "A user must have a username"],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        trim: true
    },
    avatar: {
        type: String,
        default: "mario.png",
        trim: true
    },
    inCall: {
        type: Boolean,
        default: false
    },
    online: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;