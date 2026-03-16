import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    role:     { type: String, enum: ['superadmin', 'admin', 'moderator', 'voter'], default: 'admin' },
    name:     { type: String },
    bio:      { type: String },
    org:      { type: String },
    avatar:   { type: String },
    provider: { type: String },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
