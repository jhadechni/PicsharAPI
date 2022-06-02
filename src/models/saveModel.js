const mongoose = require('mongoose')

const saveSchema = new mongoose.Schema({
    post_id: { type: mongoose.Types.ObjectId, required: true },
    user_id: { type: String, required: true }
}, { timestamps: { createdAt: 'created_date' } });


module.exports = mongoose.model('saves', saveSchema)