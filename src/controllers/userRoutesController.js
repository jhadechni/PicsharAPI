const controller = {}
const auth = require("../utils/auth")
const bcrypt = require('bcrypt')
const userModel = require('../models/userModel')

controller.login = async (req, res) => {

    try {

        if (req.body.username && req.body.password) {

            const user = await userModel.findOne({ username: req.body.username }, '-_v -_id')
            if (!user) { return res.status(404).json({ message: "Username incorrect", statusCode: 404 }) }

            const payload = {
                'username': user.username,
                'password': user.password
            }

            const validPassword = await bcrypt.compare(req.body.password, payload.password);
            const token = auth.createToken(payload)
            if (!validPassword) { return res.status(404).json({ message: "Password incorrect", statusCode: 404 }) }
            return res.status(200).json({ token })

        } else {

            if (!req.body.token) { return res.sendStatus(400) }
            if (!await auth.verifyTokenBody(req, res)) { return res.status(401).json({ message: 'token no valido', statusCode: 401 }) }
            return res.status(200).json({ token })
        }
    } catch (error) {

        console.log(error)
        res.status(500).json({ data: "Server internal error" })

    }
}

controller.register = async (req, res) => {

    if (!req.body.username || !req.body.password || !req.body.email  || !req.body.bio) { return res.sendStatus(400) }

    const user = await userModel.findOne({ cedula: req.body.cedula })

    try {

        if (user) { return res.status(208).json({ message: "User already exist" }) }
        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
        await userModel.create(req.body)

        const payload = {
            'username': req.body.username,
            'password': req.body.password
        }

        const token = auth.createToken(payload)
        return res.status(201).json({ token })

    } catch (error) {

        console.log(error)
        return res.status(500).json({ data: "Server internal error", error: error })
    }
}

controller.getUser = async (req, res) => {

    if (!req.query.user_id) { return res.sendStatus(400) }

}
module.exports = controller