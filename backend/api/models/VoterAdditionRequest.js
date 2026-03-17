import mongoose from 'mongoose';

const decisionSchema = new mongoose.Schema({
    email:     { type: String, required: true, lowercase: true },
    decision:  { type: String, enum: ['validate', 'invalidate'], required: true },
    reason:    { type: String, default: '' },
    decidedAt: { type: Date, default: Date.now },
}, { _id: false });

const voterAdditionRequestSchema = new mongoose.Schema({
    scrutinAddress: { type: String, required: true, lowercase: true },
    sessionIdx:     { type: Number, required: true },
    sessionTitle:   { type: String, default: '' },
    scrutinTitle:   { type: String, default: '' },
    emails:         [{ type: String, lowercase: true }],
    requestedBy:    { type: String, lowercase: true },
    status:         { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    moderators:     [{ type: String, lowercase: true }],
    decisions:      [decisionSchema],
    appliedAt:      { type: Date },
}, { timestamps: true });

voterAdditionRequestSchema.index({ scrutinAddress: 1 });

export default mongoose.model('VoterAdditionRequest', voterAdditionRequestSchema);
