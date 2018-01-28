const express = require('express');
const initData = require('./fakeData');

const router = express.Router();

router.get('/user', initData.getUser);
router.get('/firstuser', initData.getFirstUser);
router.get('/post', initData.getPost);
router.get('/comment', initData.getComment);


module.exports = router;
