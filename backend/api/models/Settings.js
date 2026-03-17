import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    key: { type: String, default: 'platform', unique: true },
    showResultsToVoters: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
