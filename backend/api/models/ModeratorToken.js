import mongoose from 'mongoose';

const moderatorTokenSchema = new mongoose.Schema({
    token:     { type: String, required: true, unique: true },
    email:     { type: String, required: true, lowercase: true },
    scrutinId: { type: String, lowercase: true },
    type:      { type: String, default: 'moderator' },
    createdAt: { type: Date, default: Date.now, expires: '7d' }, // TTL: supprimé automatiquement après 7 jours
});

export default mongoose.model('ModeratorToken', moderatorTokenSchema);
