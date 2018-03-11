const express = require('express');
const router = express.Router();

const post = require('./post');
const postComment = require('./postComment');

const auth = require('../../lib/middlewars/auth');


// 文章路由
// http://www.foo.com/api/posts
router.post('',                                 auth, post.addArticle);
router.delete('/:postId',                       auth, post.deleteArticle);
router.put('/:postId',                          auth, post.updateArticle);
router.get('/:postId',                          auth, post.getArticle);         // 为了能访问他人的文章， get 请求都不应该加 auth 认证才对

// 获得用户的所有文章的路由需要添加目标用户的id 信息，而其他的操作则不需要这一点
// 因为敏感操作中 id 只从 token 中获取，只涉及登录用户，而不是目标用户
// 获取某个文章则又不需要用户id，只需要文章id
// 唯有拿取所有文章这个请求，需要目标用户的id
// 由于前缀是 post 已经改不了了，用户ID信息用参数传递好了
router.get('/',                                 auth, post.getArticles);


// 某篇文章的评论路由
// http://www.foo.com/api/posts/:id/comments
router.get('/:postId/comments/',                auth, postComment.getComments);
router.get('/:postId/comments/:commentId',      auth, postComment.getComment);
router.post('/:postId/comments',                auth, postComment.addComment);
router.put('/:postId/comments/:commentId',      auth, postComment.updateComment);
router.delete('/:postId/comments/:commentId',   auth, postComment.deleteComment);


module.exports = router;

