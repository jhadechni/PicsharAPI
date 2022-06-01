const controller = {}
const jwt = require('jsonwebtoken')

controller.verifyTokenHeader = async (req, res) => {
    try {
        const authHeader = await req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

controller.verifyTokenBody = async (req, res) => {
    try {
        const token = await req.body.token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        return true
    } catch (error) {
        console.log(error)
        return false
    }
}

controller.createToken = (payload) => jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET)

module.exports = controller