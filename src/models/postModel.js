const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    img_url: { type: String },
    bio: { type: String, default: '' },
    author : { type: String, required: true }
})


module.exports = mongoose.model('posts', postSchema)