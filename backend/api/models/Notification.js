import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    type:    { type: String },
    title:   { type: String },
    message: { type: String },
    data:    { type: mongoose.Schema.Types.Mixed },
    email:   { type: String },
    orgName: { type: String },
    read:    { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
