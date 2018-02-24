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
    const userId = req.params.id;
    try {
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
            followingCount
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
            return res.status(400).send({ message: 'no such user'})
        }
        if(await user.hasFollowing(followedUser)) {                  // 有可能已经关注过了
            return res.status(400).send({ message: 'already followed' })
        }

        user.addFollowing(followedUser);                             // 注意在数据库添加时，我们使用的是属于关系。于是我关注了某人，就代表我成了某人的 follower
        return res.status(200).send({ message: 'followed success' });
    } catch(err) { console.log(err) };
}

async function unfollow(req, res) {
    const userId = req.userId;
    const followedUserId = req.params.followersId;
    try {
        const user = await User.findById(userId);
        const followedUser = await User.findById(followedUserId);
        user.removeFollowing(followedUser);
        return res.status(200).send({ message: 'unfollowed success' });
    } catch (err) { console.log(err) };
}

// 获取我关注的人的名单
async function getFollowings(req, res) {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        const followings = await user.getFollowing().then(users => users.map(user => ({ username: user.username, avatarHash: user.avatarHash, id: user.id })));
        // 这里筛选了用户的信息，以后在定夺具体返回多少
        return res.status(200).send(followings)
    } catch(err) { console.log(err) };
}

// 获取关注我的人的名单
async function getFollowers(req, res) {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        const followers = await user.getFollower().then(users => users.map(user => ({ username: user.username, avatarHash: user.avatarHash, id: user.id })));
        return res.status(200).send(followers)
    } catch(err) { console.log(err) };

}


// 在所有的被关注的用户列表中，提取他们的 id 组成数组
// 然后依据这些 id 找到所有的动态（其实是全部文章）集合。但是这个时候，这个集合中并没有我们需要的用户信息
// 所有最后还需要给每个动态添加上该动态的用户信息
async function getActivities(req, res) {
    const userId = req.params.id;
    try {
        const user = await User.findById(userId);
        // 还是很迷糊不懂
        const postsOrigin = await User.findById(userId)
                .then(user => {                                                     // 找到当前用户
                    return user.getFollowing()                                             // 拿到他的所有的关注用户
                        .then(users => {                                            // 对关注用户数组进行操作
                            return Promise.all(                                     //
                                users.map(user => user.getArticles()                // 取出每个被关注用户的文章数据
                                            .then(posts => posts.map(post => ({
                                                    id: post.id,
                                                    title: post.title,
                                                    slug: post.slug,
                                                    authorId: post['author_id'],
                                                })                                  // 对文章数据进行筛选
                                            ))
                                )
                            )
                        })
                })

        const posts = R.flatten(postsOrigin);

        const users = await Promise.all(posts.map(post => User.findById(post.authorId).then(user => user.dataValues)))

        const activities = posts.map((post, i)=> {
            return {
                user: users[i].username,
                avatarHash: users[i].avatarHash,
                title: post.title,
            }
        })

        // console.log(posts)
        // console.log(activities)

        return res.send(activities)
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
        const followedIds = [1, 2, 3, 4]
        const foo = await Promise.all(followedIds.map(async id => {
            const followed = await User.findById(id);
            user.addFollowing(followed);
            return followed;
        }))
    }, 1000)
