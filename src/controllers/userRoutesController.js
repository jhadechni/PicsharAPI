const { verifyTokenBody } = require("../utils/auth")

const controller = {}

controller.login = async (req, res) => {

    try {
        if (req.body.username || req.body.password) {

            const user = await userModel.findOne({ username: req.body.username }, '-_v -_id -password')

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

            if (!await verifyTokenBody(req, res)) { return res.status(401).json({ message: 'token no valido', statusCode: 401 }) }
            
            return res.status(200).json({ token })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ data: "Server internal error" })
    }
}


module.exports = controller