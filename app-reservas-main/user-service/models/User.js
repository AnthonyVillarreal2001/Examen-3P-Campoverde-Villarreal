import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    telefono: {
        type: String,
        match: /^[0-9]{9,15}$/,
        required: false
    },
    direccion: {
        type: String,
        trim: true
    },
    preferencias: {
        type: [String],
        default: []
    }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
