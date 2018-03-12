/**
 * 注册成功之后不会重定向到登录界面，而是发送成功的信息
 * 暂时不用生产 token，还是让客户端用表单登录
 * 验证输入的字段
 * 储存用户
 * 发回成功信息
 */

const jwt = require('jsonwebtoken')
const db = require('../../models');

const { User } = db;
const SECRET = 'skdjflksdjflksjdlkfjskldjflksdjflksdjkfjsdkf';
// 各字段的匹配正则，后期都应该放到配置文件中
const regUsername = /^[\u0391-\uFFE5]+$/,                // 匹配一个或者多个汉子
      regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
      regPassword = /^[a-zA-Z0-9]{6,16}$/;                 // 以字母开头，长度在 6-16 之间


module.exports = register;

async function register(req, res) {
    const { username, email, password } = req.body;
    // 首先排除邮箱是否注册过
    try {
        const user = await User.findOne({ where: { email: email } });
        if(user) {
            return res.status(400).send({ message: '该邮箱已经被占用', errorType: 'email'})
        }

    } catch(err) {
        console.log(err);
    }

    if(username && email && password) {

        // 验证字段
        if(!regUsername.test(username)) {
            return res.status(400).send({ message: '用户名不符合要求', errorType: 'username' });
        };
        if(!regEmail.test(email)) {
            return res.status(400).send({ message: '邮箱不符合要求', errorType: 'email' });
        };
        if(!regPassword.test(password)) {
            return res.status(400).send({ message: '密码不符合要求', errorType: 'password'});
        }

    } else {
        return res.status(400).send({ message: '字段不完整，无法提交', errorType: 'fieldlack' })
    }

    const newUser = {
        username: username,
        email: email,
        password: password
    };
    try {
        await User.create(newUser);
    } catch(err) {
        console.log(err)
    }
    res.status(200).send({ message: 'register success' })
}
