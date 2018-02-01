/**
 * 评论模块应该包括对具体某个评论的增删改查
 *
 * 如果对评论删除直接通过模型来操作。副作用是用户可能会发起修改他人的评论内容。
 * 我们可以先通过查询当前用户是否拥有该评论，然后在通过文章的模型来添加予以操作。然后这个时候评论模型会记住 userId 吗？ 我们先试试看
 * 其实获取一个评论在实际的场景中，可能还要获取用户的信息。这个到时候得和具体的需求做整合
 */

const db = require('../../models');
const { User, Post, Comment } = db;

exports.addComment      = addComment;
exports.updateComment   = updateComment;
exports.deleteComment   = deleteComment;
exports.getComment      = getComment;

async function addComment(req, res) {
    const userId = req.userId;
    const { postId, comment } = req.body;
    if(postId && comment) {
        // 在操作之前，需要判定登录用户是否拥有该文章
        try {
            const user = await User.findById(userId);
            const post = await Post.findById(postId);

            if(await user.hasArticle(post)) {                               // 检查文章对于登录用户的存在性

                const newComment = await post.createComment({ body: comment });
                newComment.setCreator(user);                                // 在新的评论中还要添加上是谁创建了这条评论
                return res.send({ msg: 'comment added'})

            } else {
                res.send({ err: 'No such post' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.send({ err: 'invalid data' })
    }
}


// 更新评论可以不通过 Post 模型来完成，而是通过验证用户是否有该评论，然后再做操作
// 这样写还是会有故意修改掉该用户其他评论的隐患，但是这是能忍的
// 更新评论并不牵扯到模型之间的关系。最后的更新只需要模型用自己的更新方法就可以了
async function updateComment(req, res) {
    const userId = req.userId;
    const { commentId, comment } = req.body;                        // 需要 comment 的标识符，文章的标识可以不用
    if(commentId && comment) {
        try {
            const user = await User.findById(userId);
            const theComment = await Comment.findById(commentId);
            if(await user.hasComment(theComment)) {

                theComment.update({ body: comment });               // 更新该评论
                return res.send({ meg: 'comment update success' })
            } else {
                return res.send({ err: 'user has no such comment' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.send({ err: 'invalid data' })
    }
}

async function deleteComment(req, res) {
    const userId = req.userId;
    const { commentId } = req.body;
    if(commentId) {
        try {
            // 使用了三次数据库操作来确认评论的合法性
            const user = await User.findById(userId);
            const theComment = await Comment.findById(commentId);
            if(await user.hasComment(theComment)) {
                // user.removeComment(theComment);                  // 在用户的实例上删除了评论，但是对于文章并没有切断联系
                theComment.destroy();                               // 使用自毁方法就够了
                return res.send({ meg: 'comment delete success' })
            } else {
                return res.send({ err: 'user has no such comment' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.send({ err: 'invalid data' })
    }

}


// 单独地获取某个评论的场景可能不多
async function getComment(req, res) {
    const userId = req.userId;
    const commentId = req.params.id;
    if(commentId) {
        try {
            // 只使用了一次数据库操作来确定评论的合法性
            const theComment = await Comment.find({ where: { id: commentId, 'owner_id': userId } });        // 用筛选的方法其实更简洁
            if(theComment) {
                return res.send(theComment.dataValues)
            } else {
                return res.send({ err: 'no such comment' })
            }

        } catch(err) { console.log(err) };

    } else {
        res.send({ err: 'invalid data' })
    }


}
