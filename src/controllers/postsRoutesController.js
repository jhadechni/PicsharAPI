const controller = {};
const mongoose = require('mongoose')

const auth = require("../utils/auth");
const postModel = require('../models/postModel');
const followModel = require('../models/followModel');
const commentModel = require('../models/commentModel');
const saveModel = require('../models/saveModel');
const likeModel = require('../models/likeModel');
const userModel = require('../models/userModel');

controller.post = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.body.img_url && req.body.bio && req.body.author) {
            const createdPost = await postModel.create(req.body);
            return res.status(200).json(createdPost)
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.get = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.query.author) {
            if (req.user.user_id === req.query.author || await followModel.findOne({
                follower_id: req.user.user_id,
                following_id: req.query.author,
                status: 'accept'
            })) {
                const posts = await postModel.find({
                    author: req.query.author
                });
                return res.status(200).json(posts)
            } else {
                return res.status(404).json({ message: 'No valido', statusCode: 401 })
            }
        } else if (req.body.post_id) {
            const pipeline = [
                {
                    $match: {
                        "_id": mongoose.Types.ObjectId(req.body.post_id),
                    }
                },
                {
                    $lookup: {
                        from: 'comments',
                        localField: '_id',
                        foreignField: 'post_id',
                        as: 'comments'
                    }
                },
                {
                    $lookup: {
                        from: 'likes',
                        localField: '_id',
                        foreignField: 'post_id',
                        as: 'likes'
                    }
                }
            ];
            const post = await postModel.aggregate(pipeline);
            if (post['0']) {
                const data = {
                    img_url: post['0'].img_url,
                    bio: post['0'].bio,
                    author: post['0'].author,
                    likes: post['0'].likes.length,
                    comments: post['0'].comments
                }
                return res.status(200).json(data);
            }
            return res.status(404).json({ message: 'Not found', statusCode: 404 });
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 404 })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.timeline = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res)) {
            const pipeline = [
                {
                    "$project": {
                        "_id": 0,
                        "posts": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "posts.author",
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
                        "follows.follower_id": mongoose.Types.ObjectId(req.user.user_id),
                        "follows.status": "accept"
                    }
                },
                {
                    "$sort": {
                        "posts.created_date": -1
                    }
                },
                {
                    "$project": {
                        "posts._id": "$posts._id",
                        "posts.img_url": "$posts.img_url",
                        "posts.bio": "$posts.bio",
                        "posts.author": "$posts.author",
                        "posts.created_date": "$posts.created_date",
                        "_id": 0
                    }
                }
            ];
            if (req.query.offset) pipeline.push({ "$skip": parseInt(req.query.offset) });
            if (req.query.limit) pipeline.push({ "$limit": parseInt(req.query.limit) });
            const posts = await postModel.aggregate(pipeline);
            return res.status(200).json(posts.map(post => post.posts));
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.comment = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.body.post_id && req.body.comment) {
            const comment = await commentModel.create({
                post_id: req.body.post_id,
                comment: req.body.comment,
                user_id: req.user.user_id
            });
            return res.status(200).json(comment)
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.save = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.body.post_id && !await saveModel.findOne({
            post_id: mongoose.Types.ObjectId(req.body.post_id),
            user_id: req.user.user_id
        })) {
            const save = await saveModel.create({
                post_id: mongoose.Types.ObjectId(req.body.post_id),
                user_id: req.user.user_id
            });
            return res.status(200).json(save)
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.savedBy = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res)) {
            const pipeline = [
                {
                    "$project": {
                        "_id": 0,
                        "posts": "$$ROOT"
                    }
                },
                {
                    "$lookup": {
                        "localField": "posts._id",
                        "from": "saves",
                        "foreignField": "post_id",
                        "as": "saves"
                    }
                },
                {
                    "$unwind": {
                        "path": "$saves",
                        "preserveNullAndEmptyArrays": false
                    }
                },
                {
                    "$match": {
                        "saves.user_id": mongoose.Types.ObjectId(req.user.user_id)
                    }
                },
                {
                    "$sort": {
                        "posts.created_date": -1
                    }
                },
                {
                    "$project": {
                        "posts._id": "$posts._id",
                        "posts.img_url": "$posts.img_url",
                        "posts.bio": "$posts.bio",
                        "posts.author": "$posts.author",
                        "posts.created_date": "$posts.created_date",
                        "_id": 0
                    }
                }
            ];
            const posts = await postModel.aggregate(pipeline);
            return res.status(200).json(posts.map(post => post.posts))
        } else {
            return res.status(404).json({ message: 'No valido', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.like = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.body.post_id && !await likeModel.findOne({
            post_id: req.body.post_id,
            user_id: req.user.user_id
        })) {
            const save = await likeModel.create({
                post_id: req.body.post_id,
                user_id: req.user.user_id
            });
            return res.status(200).json(save)
        } else {
            return res.status(404).json({ message: 'Already liked', statusCode: 401 })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

controller.likedBy = async (req, res) => {
    try {
        if (await auth.verifyTokenHeader(req, res) && req.query.user_id) {
            const user = await userModel.findById(req.query.user_id);
            if (req.user.user_id === req.query.user_id || user.public_likes) {
                const pipeline = [
                    {
                        "$project": {
                            "_id": 0,
                            "posts": "$$ROOT"
                        }
                    },
                    {
                        "$lookup": {
                            "localField": "posts._id",
                            "from": "likes",
                            "foreignField": "post_id",
                            "as": "likes"
                        }
                    },
                    {
                        "$unwind": {
                            "path": "$likes",
                            "preserveNullAndEmptyArrays": false
                        }
                    },
                    {
                        "$match": {
                            "likes.user_id": mongoose.Types.ObjectId(req.query.user_id)
                        }
                    },
                    {
                        "$sort": {
                            "posts.created_date": -1
                        }
                    },
                    {
                        "$project": {
                            "posts._id": "$posts._id",
                            "posts.img_url": "$posts.img_url",
                            "posts.bio": "$posts.bio",
                            "posts.author": "$posts.author",
                            "posts.created_date": "$posts.created_date",
                            "_id": 0
                        }
                    }
                ];
                const liked_posts = await postModel.aggregate(pipeline);
                return res.status(200).json(liked_posts.map(post => post.posts))
            } else {
                return res.status(404).json({ message: 'No valido' })
            }
        } else {
            return res.status(404).json({ message: 'Token no valido' })
        }
    } catch (error) {
        res.status(500).json({ data: "Server internal error" })
    }
}

module.exports = controller