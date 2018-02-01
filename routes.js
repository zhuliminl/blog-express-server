module.exports = function(app) {
    app.use('/test', require('./api/initData'));
    app.use('/user', require('./api/user'));
    app.post('/login', require('./api/login'));
    app.post('/register', require('./api/register'));
    app.use('/post', require('./api/post'));
    app.use('/comment', require('./api/comment'));


    app.use('/*', function(req, res, next) {
        res.json({ status: 'success', data: '请求虽然成功，但是大概不是你想要的'})
    })
}
