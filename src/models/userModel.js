const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String, default: '' },
    password: { type: String, required: true },
    birthdate: { type: Date, default: Date.now },
    public_likes: {type: Boolean, default: true}
})


module.exports = mongoose.model('users', userSchema)