import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
    name:     { type: String },
    role:     { type: String },
    photoUrl: { type: String },
}, { _id: false });

const optionSchema = new mongoose.Schema({
    title:       { type: String },
    label:       { type: String },
    description: { type: String },
    imageUrl:    { type: String },
    members:     [memberSchema],
}, { _id: false });

const sessionSchema = new mongoose.Schema({
    title:               { type: String },
    description:         { type: String },
    logoUrl:             { type: String },
    options:             [optionSchema],
    voters:              [{ type: String, lowercase: true }],
    moderators:          [mongoose.Schema.Types.Mixed],
    address:             { type: String, lowercase: true },
    voterCount:          { type: Number },
    txHash:              { type: String },
    isValidated:         { type: Boolean, default: false },
    isInvalidated:       { type: Boolean, default: false },
    invalidationReason:  { type: String },
}, { _id: false });

const scrutinSchema = new mongoose.Schema({
    address:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    title:      { type: String },
    description:{ type: String },
    scope:      { type: String },
    country:    { type: String },
    timingMode: { type: String },
    startDate:  { type: String },
    endDate:    { type: String },
    type:       { type: String },
    logoUrl:             { type: String },
    showResultsToVoters: { type: Boolean, default: true },
    voters:              [{ type: String, lowercase: true }],
    sessions:            [sessionSchema],
}, { timestamps: true });

export default mongoose.model('Scrutin', scrutinSchema);
