const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower_id: { type: String, required: true },
    following_id: { type: String, required: true },
    status: {type: String, required: true}
}, { timestamps: { createdAt: 'created_date' } });


module.exports = mongoose.model('follows', followSchema);