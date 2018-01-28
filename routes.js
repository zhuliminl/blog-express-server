
module.exports = function(app) {
    app.use('/test', require('./api/initData'));


    app.use('/*', function(req, res, next) {
        res.json({ status: 'success', data: 'make it heppen'})
    })
}
