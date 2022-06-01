const mongoose = require('mongoose')

const likesSchema = new mongoose.Schema({
    id_publicacion: { type: String, required: true },
    liked_by: { type: String, required: true }
})


module.exports = mongoose.model('likes', likesSchema)