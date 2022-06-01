const controller = {};
const auth = require("../utils/auth");
const postModel = require('../models/postModel');
const followModel = require('../models/followModel');
const commentModel = require('../models/commentModel');

controller.post = async (req,res) => {
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
                        "follows.follower_id": req.user.user_id,
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
            if (req.query.offset) pipeline.push({"$skip": parseInt(req.query.offset)});
            if (req.query.limit)  pipeline.push({"$limit": parseInt(req.query.limit)});
            const posts = await postModel.aggregate(pipeline);
            return res.status(200).json(posts);
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

module.exports = controller