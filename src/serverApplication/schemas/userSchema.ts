import mongoose from 'mongoose';

export const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: [true, "A user must have a username"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "A user must have a password"]
    },
    avatar: {
        type: String,
        default: "mario.png"
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