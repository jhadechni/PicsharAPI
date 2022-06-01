const { Router } = require('express');
const router = Router();
const { request, response, followers, following } = require('../controllers/followRoutesController')

router.route('/request')
    .post(request)

router.route('/response')
    .post(response)

router.route('/followers')
    .post(followers)

router.route('/following')
    .post(following)

module.exports = router;