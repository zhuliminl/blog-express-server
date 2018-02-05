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
router.get('/:postId',                          auth, post.getArticle);
router.get('/',                                 auth, post.getArticles);


// 某篇文章的评论路由
// http://www.foo.com/api/posts/:id/comments
router.get('/:postId/comments/',                auth, postComment.getComments);
router.get('/:postId/comments/:commentId',      auth, postComment.getComment);
router.post('/:postId/comments',                auth, postComment.addComment);
router.put('/:postId/comments/:commentId',      auth, postComment.updateComment);
router.delete('/:postId/comments/:commentId',   auth, postComment.deleteComment);


module.exports = router;

