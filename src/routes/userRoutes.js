const { Router } = require('express');
const router = Router();
const {login} = require('../controllers/userRoutesController')

router.route('/login')
      .get(login)

module.exports = router;