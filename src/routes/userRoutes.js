const { Router } = require('express');
const router = Router();
const { login, register } = require('../controllers/userRoutesController')

router.route('/login')
    .post(login)

router.route('/')
    .post(register)

module.exports = router;