module.exports = function(app) {
    app.use('/api/test', require('./api/initData'));
    app.use('/api/users', require('./api/user'));
    app.post('/api/login', require('./api/login'));
    app.post('/api/register', require('./api/register'));
    app.use('/api/posts', require('./api/post'));
    // app.use('/comments', require('./api/comment'));              // 弃用。改在 /posts 路由下实现


    app.use('/*', function(req, res, next) {
        res.status(200).send({ message: '请求虽然成功，但是大概不是你想要的'})
    })
}
