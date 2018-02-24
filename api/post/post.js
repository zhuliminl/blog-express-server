/**
 *  文章模块应该包含基本的对文章的增删改查
 *
 *  获取当前用户的全部文章列表，而不包括内容
 *  获取当前用户的全部文章
 *  分页获取用户的文章。这个暂时还没具体的约定，等客户端约定好开始做
 *  还有获取关注着的最新文章, 几天之内的。以后做
 *
 *  获取某篇文章的全部评论。这个并不是在评论模块完成的。因为具体某一篇的文章的评论总是在文章的路由之下
 *
 *  unfinish
 */



const db = require('../../models');
const { User, Post, Comment } = db;

exports.addArticle      = addArticle;
exports.deleteArticle   = deleteArticle;
exports.updateArticle   = updateArticle;

exports.getArticle      = getArticle;
exports.getArticles     = getArticles;


// 添加文章
async function addArticle(req, res) {
    const userId = req.userId;
    const { title, article } = req.body;

    if(title && article) {
        try {
            const user = await User.findById(userId);
            await user.createArticle({ title, body: article });
            return res.status(200).send({ message: 'add article success' });
        } catch(err) { console.log(err) };
    } else {
        res.status(400).send({ message: '字段缺失' })
    }

}

// 删除文章
// 有没有想过删除文章的时候，改文章的评论是不是也应该删除掉
async function deleteArticle(req, res) {
    const userId = req.userId;
    const postId = req.params.postId;

    // 考虑一下假如发送的文章 ID 是另外一个用户的该怎么办。所以不能直接通过 ID 来删除文章，而应该在这个用户的基础上来删除
    try {
        const post = await Post.find({ where: { id: postId, 'author_id': userId } });

        if(!post) {
            return res.status(404).send({ message: 'post not found' })
        }
        post.destroy();
        return res.status(200).send({ message: 'article delete success' });
    } catch(err) { console.log(err) };
}

// 更新文章
async function updateArticle(req, res) {
    const userId = req.userId;                                // 更新文章在确保字段完整的情况下直接查询文章是否存在然后更新就可以了
    const postId = req.params.postId;
    const { title, article } = req.body;

    if(title && article) {
        try {
            const post = await Post.find({ where: { id: postId, 'author_id': userId } });

            if(!post) {
                return res.status(404).send({ message: 'post not found' });
            }

            await post.update({ title, body: article });
            return res.status(200).send({ message: 'article update success' });
        } catch(err) { console.log(err) };
    } else {
        res.status(400).send({ message: 'invalid data' });
    }
}

// 获取某篇文章
async function getArticle(req, res) {
    const userId = req.userId;
    const postId = req.params.postId;           // 通过 get 方法来获取

    try {
        const post = await Post.findById(postId);

        if(!post) {
            return res.status(404).send({ message: 'post not found' });
        }

        return res.status(200).send(post.dataValues);
    } catch(err) { console.log(err) };
}

// 获取全部文章
async function getArticles(req, res) {
    const userId = req.userId;
    const slugNeeded = req.query['slug']

    // 因为首页并不需要全部的文章内容，所以通过参数判断，给出一个只有带有 slug 的数据返回
    if(slugNeeded === 'true') {
        console.log('给出 slug 信息就可以了');
        try {
            const posts = await Post.findAll({
                where: { 'author_id': userId },
                attributes: {
                    exclude: ['body']
                }
            });
            return res.status(200).send(posts);
        } catch(err) { console.log(err) };

    }

    try {
        const posts = await Post.findAll({ 
            where: { 'author_id': userId },
            attributes: {
                exclude: ['slug']
            }
        });       // 有意识地在保证可读性的同时减少数据库查询
        return res.status(200).send(posts);
    } catch(err) { console.log(err) };
}

