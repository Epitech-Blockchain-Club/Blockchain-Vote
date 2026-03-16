import mongoose from 'mongoose';

const moderatorDecisionSchema = new mongoose.Schema({
    email:          { type: String, required: true, lowercase: true },
    sessionAddress: { type: String, required: true, lowercase: true },
    decision:       { type: String, enum: ['validate', 'invalidate'], required: true },
    reason:         { type: String },
}, { timestamps: true });

moderatorDecisionSchema.index({ email: 1, sessionAddress: 1 }, { unique: true });
moderatorDecisionSchema.index({ sessionAddress: 1 });

export default mongoose.model('ModeratorDecision', moderatorDecisionSchema);
