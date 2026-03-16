import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
    sessionId:   { type: String, required: true, lowercase: true },
    voterEmail:  { type: String, lowercase: true },
    voterHash:   { type: String },
    optionIndex: { type: Number, required: true },
    scrutinId:   { type: String, lowercase: true },
    txHash:      { type: String },
}, { timestamps: true });

voteSchema.index({ sessionId: 1 });
voteSchema.index({ scrutinId: 1 });

export default mongoose.model('Vote', voteSchema);
