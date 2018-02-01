/**
 * 用户可以做的事情不包括创建文章，文章的管理应该单独给文章去负责
 *
 * 那用户的职责可以是 ————
 * 获取用户的基本信息
 * 更新用户自己的基本信息。如用户名和密码
 * 关注别人和取消关注别人
 * 获取关注列表和被关注的列表
 *
 */

const db = require('../../models');
const { User } = db;

exports.getProfile      = getProfile;
exports.updateProfile   = updateProfile;
exports.follow          = follow;
exports.unfollow        = unfollow;
exports.getFollowers    = getFollowers;
exports.getFollowed     = getFollowed;


async function getProfile(req, res) {
    const userId = req.userId;
    if(userId) {
        try {
            const user = await User.findById(userId);
            return res.send(user.dataValues)
        } catch(err) { console.log(err) }
    }
    res.send({ err: 'invalid userId' })
}

// 更新自己的信息
async function updateProfile(req, res) {
    const userId = req.userId;
    const { username, password } = req.body;

    // 密码强度正则，最少6位，包括至少1个大写字母，1个小写字母，1个数字，1个特殊字符
    const regUsername = /^[a-zA-Z0-9_-]{4,16}$/,
          regPassword = /^.*(?=.{6,})(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*? ]).*$/;
    if(username && password) {
        try {
            const user = await User.findById(userId);

            if(!regUsername.test(username)) {
                return res.send({ err: '用户名不符合要求' });
            }
            if(!regPassword.test(password)) {
                return res.send({ err: '密码不符合要求' });
            }

            await user.update({ username, password });
            return res.send({ msg: 'update success' });
        } catch(err) { console.log(err) };
    } else {
        return res.send({ err: '字段不完整' });
    }
}


// 关注用户
// 关注和被关注的语义区分，务必从当前用户为参照对象的主观角度去出发
// 我有很多关注者 —— followers
// 我关注过很多人 —— followed
async function follow(req, res) {
    const userId = req.userId;
    const { followedUserId } = req.body;                                // 即将被关注的用户
    if(followedUserId) {
        try {
            const user = await User.findById(userId);
            const followedUser = await User.findById(followedUserId);
            user.addFollower(followedUser);                             // 注意在数据库添加时，我们使用的是属于关系。于是我关注了某人，就代表我成了某人的 follower
            return res.send({ msg: 'followed success' });

        } catch(err) { console.log(err) };
    } else {
        res.send({ err: 'invalid followedUserId' })
    }
}

async function unfollow(req, res) {
    const userId = req.userId;
    const { followedUserId } = req.body;                                // 即将被关注的用户
    if(followedUserId) {
        try {
            const user = await User.findById(userId);
            const followedUser = await User.findById(followedUserId);
            user.removeFollower(followedUser);
            return res.send({ msg: 'unfollowed success' });
        } catch (err) { console.log(err) };
    } else {
        res.send({ err: 'invalid followedUserId' })
    }
}


// 获取我关注的人的名单
async function getFollowed(req, res) {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        const followeds = await user.getFollower().then(users => users.map(user => ({ username: user.username, emaili: user.email, id: user.id })));
        // 这里筛选了用户的信息，以后在定夺具体返回多少
        return res.send(followeds)
    } catch(err) { console.log(err) };
}


// 获取关注我的人的名单
async function getFollowers(req, res) {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        const followers = await user.getFollowed().then(users => users.map(user => ({ username: user.username, emaili: user.email, id: user.id })));
        return res.send(followers)
    } catch(err) { console.log(err) };

}


// 以下暂时可以不提供
// 登出用户
async function logout(req, res) {
    // 登出让客户端自主删除 token 即可
}


// 销毁用户
async function destroy(req, res) {

}
