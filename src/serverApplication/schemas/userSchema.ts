import mongoose from 'mongoose';
import { PasswordManager } from '../utils/passwordManager';

export const userSchema = new mongoose.Schema({
    username: { 
        type: String,
        required: [true, "A user must have a username"],
        maxLength: [10, "A username cannot be longer than 10 characters"],
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

userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await PasswordManager.toHash(this.get('password'));
    }
});

const User = mongoose.model('User', userSchema);

export default User;