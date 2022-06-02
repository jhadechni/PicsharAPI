const controller = {}
const auth = require("../utils/auth")
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')
const likesModel = require('../models/likesModel')
const followModel = require('../models/followModel')
const postsModel = require('../models/postModel')

controller.login = async (req, res) => {

    try {

        if (req.body.username && req.body.password) {
            const user = await userModel.findOne({ username: req.body.username }, '-_v')
            if (!user) { return res.status(404).json({ message: "Username incorrect", statusCode: 404 }) }

            const payload = {
                'username': user.username,
                'password': user.password,
                'user_id': user._id
            }

            const validPassword = await bcrypt.compare(req.body.password, payload.password);
            const token = auth.createToken(payload)
            if (!validPassword) { return res.status(404).json({ message: "Password incorrect", statusCode: 404 }) }
            return res.status(200).json({ token })

        } else {

            if (!req.body.token) { return res.sendStatus(400) }
            if (!await auth.verifyTokenBody(req, res)) { return res.status(401).json({ message: 'token no valido', statusCode: 401 }) }
            token = req.body.token
            return res.status(200).json({token})

        }
    } catch (error) {

        console.log(error)
        return res.status(500).json({ message : "Server internal error" })

    }
}

controller.register = async (req, res) => {

    if (!req.body.username || !req.body.password || !req.body.email || !req.body.bio) { return res.sendStatus(400) }

    const user = await userModel.findOne({ username: req.body.username })
    try {

        if (user) { return res.status(409).json({ message: "User already exist" }) }
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
        const savedUser = await userModel.create(req.body)

        const payload = {
            'username': req.body.username,
            'password': req.body.password,
            'user_id': savedUser._id
        }

        const token = auth.createToken(payload)
        return res.status(201).json({ token })

    } catch (error) {

        console.log(error)
        return res.status(500).json({ data: "Server internal error", error: error })
    }
}

controller.getUser = async (req, res) => {

    try {

        if (!req.query.user_id) { return res.sendStatus(400) }
        
        if (!await auth.verifyTokenHeader(req,res)){return res.sendStatus(401)}
        
        const user = await userModel.findById({ _id: req.query.user_id }, '-_id -password -__v -birthdate')

        if (!user) { return res.status(404).json({ message: 'User not found', statusCode: 404 }) }

        const likes = await likesModel.find({ liked_by: req.query.user_id })
        const posts = await postsModel.find({ author: req.query.user_id })
        const followers = await followModel.find({ following_id: req.query.user_id, status: 'ACEEPTED' })
        const following = await followModel.find({ follower_id: req.query.user_id, status: 'ACCEPTED' })

        const userInfo = {
            ...user._doc,
            "liked_count": likes.length,
            "posts_count": posts.length,
            "followers_count": followers.length,
            "followed_count": following.length
        }

        return res.status(200).json(userInfo)

    } catch (error) {
        console.log(error)
        res.sendStatus(500)
    }

}

module.exports = controller