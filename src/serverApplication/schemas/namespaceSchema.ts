import mongoose from 'mongoose';

const namespaceSchema = new mongoose.Schema({
    _id: Number,
    name: { 
        type: String,
        required: [true, "A namespace must have a name"],
        unique: true,
        trim: true
    },
    endpoint: {
        type: String,
        required: [true, "A namespace must have an endpoint used by Socket.io"],
        trim: true
    },
    image: {
        type: String,
        required: [true, "A namespace must have an icon in the UI"],
        trim: true
    }
}, { timestamps: true });

const Namespace = mongoose.model('Namespace', namespaceSchema);

export default Namespace;