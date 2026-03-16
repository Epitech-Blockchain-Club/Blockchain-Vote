import mongoose from 'mongoose';

export const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('[DB] MONGO_URI is not set in environment variables!');
        process.exit(1);
    }

    mongoose.connection.on('connected', () => console.log('[DB] MongoDB connected'));
    mongoose.connection.on('error',     (err) => console.error('[DB] MongoDB error:', err));
    mongoose.connection.on('disconnected', () => console.warn('[DB] MongoDB disconnected'));

    await mongoose.connect(uri);
};
