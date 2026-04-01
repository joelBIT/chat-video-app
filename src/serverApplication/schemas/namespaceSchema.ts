import mongoose from 'mongoose';

const namespaceSchema = new mongoose.Schema({
    _id: Number,
    name: { 
        type: String,
        required: [true, "A namespace must have a name"],
        unique: true
    },
    endpoint: {
        type: String,
        required: [true, "A namespace must have an endpoint used by Socket.io"]
    },
    image: {
        type: String,
        required: [true, "A namespace must have an icon in the UI"]
    }
}, { timestamps: true });

const Namespace = mongoose.model('Namespace', namespaceSchema);

export default Namespace;