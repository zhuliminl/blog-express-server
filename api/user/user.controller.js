const db = require('../../models');
const { User } = db;



async function getProfile(req, res) {
    const { userId } = req;
    if(userId) {
        try {
            const user = await User.findById(userId);
            res.send(user.dataValues);
            return;
        } catch(err) {
            console.log(err);
        }
    }
    res.send('invalid userId')
}

















exports.getProfile = getProfile;
