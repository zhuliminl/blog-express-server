/**
 * 对于 GET 之外的操作， 需要排查当前用户是否请求了非当前用户的请求。如果路由中的 ID 和 Token 中 ID 不一致，则拒绝请求
 */

module.exports = idCheck;

function idCheck(req, res, next) {
    const tokenUserId = req.userId;
    const paramUserId = parseInt(req.params.id);
    if(tokenUserId !== paramUserId) {
        return res.status(403).send({ message: 'user id does not match' })
    }
    next();
}
