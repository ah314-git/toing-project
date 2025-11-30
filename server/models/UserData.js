// models/UserData.js

import mongoose from 'mongoose';

const UserDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    todosByDate: { type: Map, of: Array, default: {} },
    messagesByDate: { type: Map, of: Array, default: {} }
});

export default mongoose.model('UserData', UserDataSchema);
