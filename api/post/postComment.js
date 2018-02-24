/**
 * 评论模块应该包括对具体某个评论的增删改查
 *
 * 如果对评论删除直接通过模型来操作。副作用是用户可能会发起修改他人的评论内容。
 * 我们可以先通过查询当前用户是否拥有该评论，然后在通过文章的模型来添加予以操作。然后这个时候评论模型会记住 userId 吗？ 我们先试试看
 * 其实获取一个评论在实际的场景中，可能还要获取用户的信息。这个到时候得和具体的需求做整合
 */


const db = require('../../models');
const { User, Post, Comment } = db;


exports.getComments     = getComments;
exports.getComment      = getComment;
exports.addComment      = addComment;
exports.updateComment   = updateComment;
exports.deleteComment   = deleteComment;


// 获取谋篇文章的所有评论
async function getComments(req, res) {
    const userId = req.userId;
    const postId = req.params.postId;
    if(postId) {
        try {
            const post = await Post.findById(postId);
            if(!post) {
                return res.status(404).send({ message: 'no such post' });
            }
            const comments = await post.getComments();
            return res.status(200).send(comments);
        } catch(err) { console.log(err) };

    } else {
        res.status(400).send({ message: 'invalid data' });
    }
}


async function addComment(req, res) {
    const userId = req.userId;
    const postId = req.params.postId;
    const { comment } = req.body;
    if(comment) {
        // 在操作之前，需要判定登录用户是否拥有该文章
        try {
            const post = await Post.find({ where: { id: postId, 'author_id': userId } });
            if(post) {
				// 在新的评论中还要添加上是谁创建了这条评论
                const newComment = await post.createComment({ body: comment, 'owner_id': userId });
                return res.status(200).send({ message: 'comment added'})

            } else {
                res.status(404).send({ message: 'no such post' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.status(400).send({ message: 'invalid data' })
    }
}


// 更新评论可以不通过 Post 模型来完成，而是通过验证用户是否有该评论，然后再做操作
// 这样写还是会有故意修改掉该用户其他评论的隐患，但是这是能忍的
// 更新评论并不牵扯到模型之间的关系。最后的更新只需要模型用自己的更新方法就可以了
async function updateComment(req, res) {
    const userId = req.userId;
    const commentId = req.params.commentId;
    const { comment } = req.body;
    if(comment) {
        try {
            const theComment = await Comment.find({ where: { id: commentId, 'owner_id': userId } });
            if(theComment) {
                theComment.update({ body: comment });               // 更新该评论
                return res.status(200).send({ message: 'comment update success' })
            } else {
                return res.status(404).send({ message: 'user has no such comment' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.status(400).send({ message: 'invalid data' })
    }
}

async function deleteComment(req, res) {
    const userId = req.userId;
    const commentId = req.params.commentId;
    if(commentId) {
        try {
            const theComment = await Comment.find({ where: { id: commentId, 'owner_id': userId } });
            if(theComment) {
                // user.removeComment(theComment);                  // 在用户的实例上删除了评论，但是对于文章并没有切断联系
                theComment.destroy();                               // 使用自毁方法则关系全都会被切断
                return res.status(200).send({ message: 'comment delete success' })
            } else {
                return res.status(404).send({ message: 'user has no such comment' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.status(400).send({ message: 'invalid data' })
    }

}


// 单独地获取某个评论的场景可能不多
async function getComment(req, res) {
    const userId = req.userId;
    const commentId = req.params.commentId;
    try {
        const theComment = await Comment.find({ where: { id: commentId, 'owner_id': userId } });
        if(theComment) {
            return res.status(200).send(theComment.dataValues)
        } else {
            return res.status(404).send({ message: 'no such comment' })
        }

    } catch(err) { console.log(err) };
}
