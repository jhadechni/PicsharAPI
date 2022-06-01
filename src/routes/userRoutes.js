const { Router } = require('express');
const router = Router();
const { login, register, getUser } = require('../controllers/userRoutesController')

router.route('/login')
    .post(login)

router.route('/')
    .post(register)
    .get(getUser)

module.exports = router;