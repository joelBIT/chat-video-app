import mongoose from 'mongoose';
import { Password } from '../services/passwordService';

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

userSchema.pre('save', async function() {
    if (this.isModified('password')) {
        this.password = await Password.toHash(this.get('password'));
    }
});

const User = mongoose.model('User', userSchema);

export default User;