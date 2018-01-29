const jwt = require('jsonwebtoken')
const db = require('../../models');

const { User } = db;
const SECRET = 'skdjflksdjflksjdlkfjskldjflksdjflksdjkfjsdkf';

async function login(req, res) {
    // 检查是否在请求新的 token
    const { tokenStatus } = req.body;
    if(tokenStatus === 'expired' ) {
        const refreshToken = req.get('x-refresh-token');

        // 这次验证 refreshToken 来获取用户 ID ，refreshToken 具有长期性，
        // 如果在每次更新 token 的时候同时也重新创建 refreshToken, 理论上 refreshToken 就永远都不会过期
        jwt.verify(refreshToken, SECRET, function(err, data) {
            console.log('jwt verifing refreshToken')

            if(err) {
                if(err.name === 'TokenExpiredError') {
                    res.send({ err: 'refreshToken expired' })
                    return;
                }
                console.log(err.name)
                if(err.name === 'JsonWebTokenError') {
                    res.send({ err: 'invalid refreshToken' })
                    return;
                }
            }

            const { id, exp } = data;           // 解析 token 的信息

            const { token, refreshToken } =  createTokens(id, SECRET);     // 刷新这两个 token
            res.set('x-token', token);
            res.set('x-refresh-token', refreshToken);
            res.send('token refreshed, please resend your request');
        })
        return;
    }

    const { email, password } = req.body;

    if(validate(email, password)) {                 // 如果验证密码成功

    }

    try {
        const user = await User.findOne({ where: { email: email } });
        if(!user) {
            res.send('user not found')
            return ;
        }

        // 创建 refreshToken 和 token
        const { token, refreshToken } =  createTokens(user.id, SECRET);

        res.set('x-token', token);
        res.set('x-refresh-token', refreshToken);
        res.send('login success');

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
    const token = jwt.sign({ id: userId }, SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: userId }, SECRET, { expiresIn: '1d' });
    return {
        token,
        refreshToken
    }
}

function validate(email, password) {
    return true;
}


module.exports = login;
