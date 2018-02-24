module.exports = function(app) {
    app.use('/test', require('./api/initData'));
    app.use('/users', require('./api/user'));
    app.post('/login', require('./api/login'));
    app.post('/register', require('./api/register'));
    app.use('/posts', require('./api/post'));
    // app.use('/comments', require('./api/comment'));              // 弃用。改在 /posts 路由下实现


    app.use('/*', function(req, res, next) {
        res.status(200).send({ message: '请求虽然成功，但是大概不是你想要的'})
    })
}
