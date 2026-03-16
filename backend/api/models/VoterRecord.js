import mongoose from 'mongoose';

const voterRecordSchema = new mongoose.Schema({
    email:       { type: String, required: true, lowercase: true },
    scrutinId:   { type: String, required: true, lowercase: true },
    hasVoted:    { type: Boolean, default: true },
    txHash:      { type: String },
    inactivated: { type: Boolean, default: false },
    votedAt:     { type: Date, default: Date.now },
});

voterRecordSchema.index({ email: 1, scrutinId: 1 }, { unique: true });
voterRecordSchema.index({ scrutinId: 1 });

export default mongoose.model('VoterRecord', voterRecordSchema);
