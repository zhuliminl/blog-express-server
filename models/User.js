const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        avatarHash: DataTypes.STRING,
        aboutMe: {
            type: DataTypes.STRING,
            defaultValue: '这人很懒，什么都没留下'
        }
    }, {
        timestamps: false,
        hooks: {
            beforeValidate: function(user) {        // 其实这个时候传过来的 user.passwordHash 还是 password 原始值
                user.password = bcrypt.hashSync(user.password, 8);
                user.avatarHash = crypto.createHash('md5').update(user.email, 'utf8').digest('hex');     // 生成头像散列值
            }
        }
    });

    /**
     * 定义实体和实体之间的建立联系的类方法
     * @param models 模型
     */
    User.associate = (models) => {
        User.hasMany(models.Post, { as: 'articles', foreignKey: 'author_id' });

        User.hasMany(models.Comment, { as: 'comments', foreignKey: 'owner_id' });

        User.belongsToMany(User, { as: 'follower', through: 'Follows', foreignKey: 'follower_id' });    // 当前用户关注了很多人，属于另外一个用户的 follower
        User.belongsToMany(User, { as: 'following', through: 'Follows', foreignKey: 'following_id' });    // 当前用户正在被很多人关注，属于另一个用户的 following
    };


    return User;
}

