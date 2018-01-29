const jwt = require('jsonwebtoken')
const SECRET = 'skdjflksdjflksjdlkfjskldjflksdjflksdjkfjsdkf';

// 接受客户端的 Token，验证是否过期，过期则发送重新申请的错误消息,这个可以放在登录模块去做。中间件只负责验证
// 客户端接收到错误消息，立马发送 refreshToken 的请求。同样也是放到登录模块去做。
// 因为 refreshToken 寿命设定比 Token 长，于是服务端视为一个动作派遣，生成新的一对 Token 发送给客户端更新。
// 由于 refreshToken 可以在每次 Token 过期的时候得以更新，大大延长了它的有效期
//
// 中间件的任务：如果没过期，根据 Token 解析出用户 ID ，附加到请求对象传递到下一层;
// 具体实现上两个 Token 总是一起接受和发送的
// 由于普通的登录和 Token 的生成不属于中间件，所以放到另一个单独的模块


// 在普通的业务请求里，需要考虑认证 Token 过期的情况
function auth(req, res, next) {
    const token = req.get('x-token');
    const refreshToken = req.get('x-refresh-token');

    if(token && refreshToken) {
        // 无论结果如何，两个 token 都会照常发送回去
        res.set('x-token', token);
        res.set('x-refresh-token', refreshToken);
        // Token 过期则附带着 refreshToken 发送回去， 要求客户端发送刷新 Token 的请求
        jwt.verify(token, SECRET, function(err, data) {
            console.log('token verifing')

            if(err) {
                if(err.name === 'TokenExpiredError') {          // token 过期，发回 refreshToken 做凭证提示重新生成 token
                    res.send({ err: 'token expired' })
                    return;
                }
                if(err.name === 'JsonWebTokenError') {
                    res.send({ err: 'invalid token' })
                    return;
                }
            }

            // 解析成功则传递用户 ID
            const { id, exp } = data;           // 解析 token 的信息
            req.userId = id;
            next()
        })
    }
}

module.exports = auth;
