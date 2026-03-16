import mongoose from 'mongoose';

const voteRequestSchema = new mongoose.Schema({
    email:       { type: String, required: true, lowercase: true },
    description: { type: String },
    status:      { type: String, default: 'pending' },
}, { timestamps: true });

export default mongoose.model('VoteRequest', voteRequestSchema);
