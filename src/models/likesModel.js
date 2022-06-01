const mongoose = require('mongoose')

const likesSchema = new mongoose.Schema({
    post_id: { type: String, required: true },
    user_id: { type: String, required: true }
}, { timestamps: { createdAt: 'created_date' } });


module.exports = mongoose.model('likes', likesSchema)