const controller = {}

const mongoose = require('mongoose');

const followModel = require('../models/followModel');
const userModel = require('../models/userModel');
const auth = require("../utils/auth")

controller.request = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.body.user_id) {
            const follow = await followModel.findOne({ 
                follower_id  : req.user.user_id, 
                following_id : req.body.user_id,
                $or: [{ status: 'accept' }, { status: 'pending' }]
            });
            if (follow) {
                return res.status(404).json({ message: follow.status === 'accept' ? 'Already followd' : 'Already a request pending', statusCode: 404 })
            } else {
                await followModel.create({
                    follower_id : req.user.user_id,
                    following_id: req.body.user_id,
                    status: 'pending'
                })
                return res.status(200).json({ message: 'OK'})
            }
        } else {
            return res.status(401).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.response = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.body.request_id && req.body.action) {
            const follow = await followModel.findById(req.body.request_id);
            if (follow.following_id.toString() !== req.user.user_id) { 
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
        if (await auth.verifyTokenHeader(req, res) && req.query.user_id) {
            if (req.user.user_id === req.query.user_id || await followModel.findOne({
                follower_id: req.user.user_id,
                following_id: req.query.user_id,
                status: 'accept'
            })) {
                const pipeline = [
                    {
                        "$project": {
                            "_id": 0,
                            "users": "$$ROOT"
                        }
                    }, 
                    {
                        "$lookup": {
                            "localField": "users._id",
                            "from": "follows",
                            "foreignField": "follower_id",
                            "as": "follows"
                        }
                    }, 
                    {
                        "$unwind": {
                            "path": "$follows",
                            "preserveNullAndEmptyArrays": false
                        }
                    }, 
                    {
                        "$match": {
                            "follows.status": "accept",
                            "follows.following_id" : mongoose.Types.ObjectId(req.query.user_id)
                        }
                    }, 
                    {
                        "$project": {
                            "users._id": "$users._id",
                            "users.username": "$users.username",
                            "users.bio": "$users.bio",
                            "_id": 0
                        }
                    }
                ];
                const follow = await userModel.aggregate(pipeline);
                return res.status(200).json(follow.map(user => user.users))
            } else {
                return res.status(404).json({ message: 'No valido', statusCode: 401 })
            }
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.following = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.query.user_id) {
            if (req.user.user_id === req.query.user_id || await followModel.findOne({
                follower_id: req.user.user_id,
                following_id: req.query.user_id,
                status: 'accept'
            })) {
                const pipeline = [
                    {
                        "$project": {
                            "_id": 0,
                            "users": "$$ROOT"
                        }
                    }, 
                    {
                        "$lookup": {
                            "localField": "users._id",
                            "from": "follows",
                            "foreignField": "following_id",
                            "as": "follows"
                        }
                    }, 
                    {
                        "$unwind": {
                            "path": "$follows",
                            "preserveNullAndEmptyArrays": false
                        }
                    }, 
                    {
                        "$match": {
                            "follows.status": "accept",
                            "follows.follower_id" : mongoose.Types.ObjectId(req.query.user_id)
                        }
                    }, 
                    {
                        "$project": {
                            "users._id": "$users._id",
                            "users.username": "$users.username",
                            "users.bio": "$users.bio",
                            "_id": 0
                        }
                    }
                ];
                const follow = await userModel.aggregate(pipeline);
                return res.status(200).json(follow.map(user => user.users))
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

controller.requests = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res)) {
            const follow = await followModel.find({
                following_id: req.user.user_id,
                status: 'pending'
            });
            return res.status(200).json(follow)
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

module.exports = controller