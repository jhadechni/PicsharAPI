const { Router } = require('express');
const router = Router();
const { post, get, timeline, comment, save } = require('../controllers/postsRoutesController')

router.route('/')
    .post(post)

router.route('/')
    .get(get)

router.route('/timeline')
    .get(timeline)

router.route('/comment')
    .post(comment)

router.route('/save')
    .post(save)

module.exports = router;