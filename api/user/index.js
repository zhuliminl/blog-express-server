const express = require('express');
const router = express.Router();
const user = require('./user');

const auth = require('../../lib/middlewars/auth');
const idCheck = require('../../lib/middlewars/idCheck');


// 用户路由
// http://www.foo.com/api/users
router.get('/:id',      auth, user.getProfile);
router.put('/:id',      auth, idCheck, user.updateProfile);

// 用户关注路由
router.post('/:id/followings/:followersId',         auth, idCheck, user.follow);
router.delete('/:id/followings/:followersId',       auth, idCheck, user.unfollow);
router.get('/:id/followings/',                      auth, user.getFollowings);
router.get('/:id/followers/',                       auth, user.getFollowers);
router.get('/:id/activities/',                      auth, user.getActivities);


module.exports = router;
