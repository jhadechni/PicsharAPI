const controller = {}
const followModel = require('../models/followModel')

controller.request = async (req, res) => {
    try {
        if (await auth.verifyTokenBody(req, res) && req.body.user_id) {
            const follow = await followModel.findOne({ 
                follower_id  : req.user.user_id, 
                following_id : req.body.user_id
            }, '-_v -_id');
            if (follow) { 
                return res.status(404).json({ message: "Already followed.", statusCode: 404 })
            } else {
                await followModel.create({
                    follower_id : req.user.user_id,
                    following_id: req.body.user_id,
                    status: 'pending'
                })
                return res.status(200).json({ message: 'OK'})
            }
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.response = async (req, res) => {
    try {
        if (await auth.verifyTokenBody(req, res) && req.body.request_id && req.body.action) {
            const follow = await followModel.findById(req.body.request_id);
            if (follow.following_id !== req.user.user_id) { 
                return res.status(404).json({ message: "Forbidden.", statusCode: 404 })
            } else {
                await followModel.updateOne({ _id: req.body.request_id }, { status: req.body.action });
                return res.status(200).json({ message: 'OK'})
            }
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.followers = async (req, res) => {
    try {
        if (await auth.verifyTokenBody(req, res) && req.query.user_id) {
            if (req.user.user_id === req.query.user_id || await followModel.findOne({
                follower_id: req.user.user_id,
                following_id: req.query.user_id,
                status: 'accept'
            })) {
                const follow = await followModel.find({
                    following_id: req.query.user_id,
                    status: 'accept'
                });
                return res.status(200).json(follow)
            }else {
                return res.status(404).json({ message: 'No valido', statusCode: 401 })
            }
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.following = async (req, res) => {
    try {
        if (await auth.verifyTokenBody(req, res) && req.query.user_id) {
            if (req.user.user_id === req.query.user_id || await followModel.findOne({
                follower_id: req.user.user_id,
                following_id: req.query.user_id,
                status: 'accept'
            })) {
                const follow = await followModel.find({
                    follower_id: req.query.user_id,
                    status: 'accept'
                });
                return res.status(200).json(follow)
            }else {
                return res.status(404).json({ message: 'No valido', statusCode: 401 })
            }
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}


module.exports = controller