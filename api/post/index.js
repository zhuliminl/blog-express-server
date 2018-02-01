const express = require('express');
const router = express.Router();
const controller = require('./post.controller');

const auth = require('../../lib/middlewars/auth');


// 最后应该把路由的操作都用 http 谓词来实现
router.post('', auth, controller.addArticle);
router.delete('', auth, controller.deleteArticle);
router.post('/updateArticle', auth, controller.updateArticle);
router.get('/:id', auth, controller.getArticle);
router.get('/', auth, controller.getArticles);
router.get('/:id/comments/', auth, controller.getComments);     // 获取某篇文章的全部评论



module.exports = router;

