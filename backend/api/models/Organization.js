import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema({
    id:       { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:     { type: String, required: true },
    location: { type: String, default: 'France' },
    admins:   [{ type: String, lowercase: true }],
    status:   { type: String, default: 'Active' },
}, { timestamps: true });

export default mongoose.model('Organization', organizationSchema);
