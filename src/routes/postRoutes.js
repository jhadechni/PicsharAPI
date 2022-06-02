const { Router } = require('express');
const router = Router();
const { post, get, timeline, comment, save, savedBy, like, likedBy } = require('../controllers/postsRoutesController')

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

router.route('/saved-by')
    .get(savedBy)

router.route('/like')
    .post(like)

router.route('/liked-by')
    .get(likedBy)
module.exports = router;