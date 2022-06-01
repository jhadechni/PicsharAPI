const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    post_id: { type: String, required: true },
    comment: { type: String, required: true },
    user_id: { type: String, required: true }
}, { timestamps: { createdAt: 'created_date' } });


module.exports = mongoose.model('comments', commentSchema)