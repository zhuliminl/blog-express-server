/**
 * 用户可以做的事情不包括创建文章，文章的管理应该单独给文章去负责
 *
 * 那用户的职责可以是 ————
 * 获取用户的基本信息
 * 更新用户自己的基本信息。如用户名和密码
 * 关注别人和取消关注别人
 * 获取关注列表和被关注的列表
 *
 * 为了排除恶意在自己的认证中发送了他人的用户ID 请求，可能需要做个 ID 检查，如果 URI 地址的 ID 和登录用户的 ID 不同，那就返回错误
 * 我们可以在中间件中处理这个情况
 * 对于获取资源倒还好，如果涉及到修改和删除，那就应该警惕处理
 *
 * 未完成标记 unfinish，通过这个单词去追溯需要改进的模块
 */



const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const db = require('../../models');
const { User, Post } = db;
const R = require('ramda');

exports.getProfile      = getProfile;
exports.updateProfile   = updateProfile;

exports.follow          = follow;
exports.unfollow        = unfollow;
exports.getFollowers    = getFollowers;
exports.getFollowings   = getFollowings;
exports.getActivities   = getActivities;


async function getProfile(req, res) {
    const loginedUserId = req.userId;
    const userId = req.params.id;
    try {
        const loginedUser = await User.findById(loginedUserId);
        const user = await User.find({
            where: {
                id: userId
            },
            attributes: {
                exclude: ['password']                       // 排除密码的散列值
            }
        });
        const followerCount = await user.getFollower().then(followers => followers.length);
        const followingCount = await user.getFollowing().then(followings => followings.length);

        const userProfile = {
            ...user.dataValues,
            followerCount,
            followingCount,
            isFollowing: await loginedUser.hasFollowing(user)
        }
        return res.status(200).send(userProfile);
    } catch(err) { console.log(err) }
}

// 更新自己的信息
async function updateProfile(req, res) {
    const userId = req.params.id;
    const { username, password } = req.body;

    // 密码强度正则，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
    const regUsername = /^[a-zA-Z0-9_-]{4,16}$/,
          regPassword = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/;
    if(username && password) {
        try {
            const user = await User.findById(userId);

            if(!regUsername.test(username)) {
                return res.status(400).send({ message: '用户名不符合要求' });
            }
            if(!regPassword.test(password)) {
                return res.status(400).send({ message: '密码不符合要求' });
            }

            await user.update({ username, password });
            return res.status(200).send({ message: 'update success' });
        } catch(err) { console.log(err) };
    } else {
        return res.status(400).send({ message: '字段不完整' });
    }
}

// 注意路由的设计是动词转服务名字。关注和取关，其实就是在数据库里添加和删除
async function follow(req, res) {
    const userId = req.params.id;
    const followedUserId = req.params.followersId;                  // 被关注的用户
    try {
        const user = await User.findById(userId);
        const followedUser = await User.findById(followedUserId);

        if(!followedUser) {                                         // 有可能发来的被关注用户根本不存在
            return res.status(400).send({ message: '找不到该用户'})
        }
        if(await user.hasFollowing(followedUser)) {                  // 有可能已经关注过了
            return res.status(400).send({ message: '你已经关注该用户，无需再关注' })
        }

        user.addFollowing(followedUser);                             // 注意在数据库添加时，我们使用的是属于关系。于是我关注了某人，就代表我成了某人的 follower
        return res.status(200).send({ message: '关注成功' });
    } catch(err) { console.log(err) };
}

async function unfollow(req, res) {
    const userId = req.userId;
    const followedUserId = req.params.followersId;
    try {
        const user = await User.findById(userId);
        const followedUser = await User.findById(followedUserId);
        user.removeFollowing(followedUser);
        return res.status(200).send({ message: '取消关注成功' });
    } catch (err) { console.log(err) };
}

// 之前写错了。只考虑了你我这两种关系
// 当我们浏览一个普通用户的关注列表时候，对方的关注列表中人(可以称之为第三方用户）的关注和不关注状态，应该是和当前登录的我之间的关系
// 而不是第三方和这个普通用户
// 简单说：这里有三个参与者，即你我他
async function getFollowings(req, res) {
    const loginedUserId = req.userId;
    const targetUserId = req.params.id;
    try {
        const targetUser = await User.findById(targetUserId);
        const loginedUser = await User.findById(loginedUserId);

        const followinigsList = await targetUser.getFollowing();
        const followings = await Promise.all(followinigsList.map(async targetUser => {
                            return {
                                id: targetUser.id,
                                username: targetUser.username,
                                avatarHash: targetUser.avatarHash,
                                isFollowing: await loginedUser.hasFollowing(targetUser)
                            }
                        }
                    )
                )

        return res.status(200).send(followings)
    } catch(err) { console.log(err) };
}

async function getFollowers(req, res) {
    const loginedUserId = req.userId;
    const targetUserId = req.params.id;
    try {
        const targetUser = await User.findById(targetUserId);
        const loginedUser = await User.findById(loginedUserId);

        const followersList = await targetUser.getFollower();
        const followers = await Promise.all(followersList.map(async targetUser => {
                            return {
                                id: targetUser.id,
                                username: targetUser.username,
                                avatarHash: targetUser.avatarHash,
                                isFollowing: await loginedUser.hasFollowing(targetUser)
                            }
                        }
                    )
                )

        return res.status(200).send(followers)
    } catch(err) { console.log(err) };

    // const userId = req.params.id;
    // try {
        // const user = await User.findById(userId);
        // // const followers = await user.getFollower().then(users => users.map(user => ({ username: user.username, avatarHash: user.avatarHash, id: user.id })));


        // // 在我被其他用户关注的列表中，并没有体现我是否正在关注其他人（可以称之为目标用户）
        // // 所以如果想让列表更丰富一点，有必要在关注列表中返回我和目标用户的关系
        // // 这样才能更好地发起我与目标用户的关注和解关注这两个动作
        // // 在获取我正在关注的人的函数中，可以简单地返回 isFolloing 永远为 True
        // // 但是在获取我被他人关注的函数中，则需要一个进行判断后才能返回具体数据

        // const followersList = await user.getFollower();                             // 至于这里的命名，还是倾向于用户字数多描述来限定更少的信息
                                                                                    // // 所以，followers 应该一直用来陈放可能偏多的不确定的返回信息比较好
                                                                                    // // 即便其他地方用 foos 来表达了更确切的信息，但是由于需求不同
                                                                                    // // foos 也可以就是 foosList
                                                                                    // // 好吧。这个注释很无聊。记得删除
        // const followers = await Promise.all(followersList.map(async targetUser => {
                                // const user = await User.findById(userId);           // 获取当前用户，用户下面判断和目标用户的关系
                                // return {
                                    // id: targetUser.id,
                                    // username: targetUser.username,
                                    // avatarHash: targetUser.avatarHash,
                                    // isFollowing: await user.hasFollowing(targetUser)
                                // }
                            // }
                        // )
                    // );

        // return res.status(200).send(followers)
    // } catch(err) { console.log(err) };

}


// 拿到被关注的用户列表
// 取出每个用户的文章。然后专门提取出需要的数据。
// 这个时候的数据结构是数组中有数组，数据需要被摊平后继续使用
// 根据每个文章的作者 ID ，从数据库中取出该 ID 的用户信息
// 最后把文章的数据和用户的数据合并，组成前端需要的动态信息
async function getActivities(req, res) {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        const followings = await user.getFollowing();
        const postsOrigin = await Promise.all(followings.map(user =>
                                        user.getArticles()
                                            .then(posts => posts.map(
                                                post => {
                                                    return {
                                                        id: post.id,
                                                        title: post.title,
                                                        slug: post.slug,
                                                        authorId: post['author_id'],
                                                    }
                                                }
                                            )
                                        )
                                    )
                                );

        const posts = R.flatten(postsOrigin);           // 摊平数据

        const authors = await Promise.all(posts.map(post =>
                                            User.findById(post.authorId)
                                                .then(user => {
                                                    return {
                                                        userId: user.id,
                                                        username: user.username,
                                                        avatarHash: user.avatarHash,
                                                    }
                                                }
                                            )
                                        )
                                    );

        const activities = posts.map((post, i)=> {
                                    return {
                                        authorId: authors[i].userId,
                                        author: authors[i].username,
                                        avatarHash: authors[i].avatarHash,
                                        postId: post.id,
                                        title: post.title,
                                    }
                                }
                            );

        return res.status(200).send(activities.reverse());          // 以后再改成按照更新时间排序

    } catch(err) { console.log(err) };
    return res.send('ok')

}


// 以下暂时可以不提供
// 登出用户
async function logout(req, res) {
    // 登出让客户端自主删除 token 即可
}

// 销毁用户
async function destroy(req, res) {

}


// 为了调试，自动关注一些用户。记得删除
    setTimeout(async function()  {
        const user = await User.findById(1);
        const followedIds = [1, 3, 4]
        const foo = await Promise.all(followedIds.map(async id => {
            const followed = await User.findById(id);
            user.addFollowing(followed);
            return followed;
        }))
        const canfeng = await User.findById(2);
        canfeng.addFollowing(user);

    }, 1000)
