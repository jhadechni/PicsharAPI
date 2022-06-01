const { Router } = require('express');
const router = Router();
const { request, response, followers, following, requests } = require('../controllers/followRoutesController')

router.route('/request')
    .post(request)

router.route('/response')
    .post(response)

router.route('/followers')
    .get(followers)

router.route('/following')
    .get(following)

router.route('/requests')
    .get(requests)

module.exports = router;