const express = require('express');
const router = express.Router();
const controller = require('./user.controller');

const auth = require('../../lib/middlewars/auth');

router.get('/profile', auth, controller.getProfile);
router.post('/profile', auth, controller.updateProfile);
router.post('/follow', auth, controller.follow);
router.post('/unfollow', auth, controller.unfollow);
router.get('/followers/', auth, controller.getFollowers);
router.get('/followed/', auth, controller.getFollowed);

module.exports = router;

