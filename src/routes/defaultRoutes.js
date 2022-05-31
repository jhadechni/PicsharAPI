const { Router } = require('express');
const router = Router();
const {defaultRoute} = require('../controllers/defaultRoutesController')

router.route('/')
      .get(defaultRoute)

module.exports = router;