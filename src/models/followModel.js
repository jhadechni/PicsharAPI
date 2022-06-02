const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower_id: { type: mongoose.Types.ObjectId, required: true },
    following_id: { type: mongoose.Types.ObjectId, required: true },
    status: {type: String, required: true}
}, { timestamps: { createdAt: 'created_date' } });


module.exports = mongoose.model('follows', followSchema);