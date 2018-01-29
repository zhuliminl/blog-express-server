const express = require('express');
const router = express.Router();
const controller = require('./user.controller');

// 认证的中间件
const auth = require('../../lib/middlewars/auth');

router.get('/profile', auth, controller.getProfile);

module.exports = router;

