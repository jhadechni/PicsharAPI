const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    img_url: { type: String },
    bio: { type: String, default: '' },
    author : { type: mongoose.Types.ObjectId, required: true }
}, { timestamps: { createdAt: 'created_date' } });


module.exports = mongoose.model('posts', postSchema)