const jwt = require('jsonwebtoken')
const db = require('../../models');

const { User } = db;
const SECRET = 'foobarfoobar';

module.exports = login;

async function login(req, res) {

    // 检查是否在请求新的 token
    const { tokenStatus } = req.body;
    if(tokenStatus === 'expired' ) {
        const refreshToken = req.get('x-refresh-token');

        // 验证 refreshToken 来获取用户 ID ，refreshToken 具有长期性，
        // 如果在每次更新 token 的时候同时也重新创建 refreshToken, refreshToken 就可以一直续期
        jwt.verify(refreshToken, SECRET, function(err, data) {
            console.log('jwt verifing refreshToken')

            if(err) {
                if(err.name === 'TokenExpiredError') {
                    return res.status(400).send({ message: 'refreshToken expired' })
                }
                console.log(err.name)
                if(err.name === 'JsonWebTokenError') {
                    return res.status(400).send({ message: 'invalid refreshToken' })
                }
            }

            const { id, exp } = data;                                       // 解析 token 的信息

            const { token, refreshToken } =  createTokens(id, SECRET);      // 刷新这两个 token
            res.set('x-token', token);
            res.set('x-refresh-token', refreshToken);
            res.status(400).send({ message : 'token refreshed, please resend your request' });      // 提醒重新发送业务请求
        })
        return;
    }

    const { email, password } = req.body;
    // 这里的处理顺序是有问题的
    // 应该先处理用户的判断，再来对比密码认证
    if(validate(email, password)) {                 // 如果验证密码成功，这个随时都可以写
    }

    try {
        const user = await User.findOne({ where: { email: email } });
        if(!user) {
            return res.status(404).send({ message: 'user not found'})
        }

        // 创建 refreshToken 和 token
        const { token, refreshToken } =  createTokens(user.id, SECRET);

        res.set('x-token', token);
        res.set('x-refresh-token', refreshToken);
        res.status(200).send({
            message: 'login success',
            userId: user.id
        });

    } catch(err) {
        console.log(err);
    }
}

/**
 * 创建 Tokens
 * @param Number 用户 ID
 * @param String 密钥
 * @return Object 两个 Token
 */
function createTokens(userId, SECRET) {
    const token = jwt.sign({ id: userId }, SECRET, { expiresIn: '50d' });
    const refreshToken = jwt.sign({ id: userId }, SECRET, { expiresIn: '70d' });
    return {
        token,
        refreshToken
    }
}

function validate(email, password) {
    return true;
}


