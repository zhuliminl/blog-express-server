const express = require('express');
const router = express.Router();
const comment = require('./comment.controller');

const auth = require('../../lib/middlewars/auth');

router.post('', auth, comment.addComment);
router.put('', auth, comment.updateComment);
router.delete('', auth, comment.deleteComment);
router.get('/:id', auth, comment.getComment);

// 弃用。除非以后写 user/:id/comemnts 级别的路由，则会写在这个模块
// module.exports = router;
