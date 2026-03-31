import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
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
        required: [true, "A user must have an avatar"],
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
});

const User = mongoose.model('User', userSchema);

export default User;