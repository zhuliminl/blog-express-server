const express = require('express');
const router = express.Router();
const controller = require('./comment.controller');

const auth = require('../../lib/middlewars/auth');

router.post('', auth, controller.addComment);           // http://www.foo.com/comment 的 post
router.put('', auth, controller.updateComment);
router.delete('', auth, controller.deleteComment);
router.get('/:id', auth, controller.getComment);

module.exports = router;

