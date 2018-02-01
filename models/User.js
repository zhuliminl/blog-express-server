const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        timestamps: false,
        hooks: {
            beforeValidate: function(user) {        // 其实这个时候传过来的 user.passwordHash 还是 password 原始值
                user.password = bcrypt.hashSync(user.password, 8)
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
        User.belongsToMany(User, { as: 'followed', through: 'Follows', foreignKey: 'followed_id' });    // 当前用户被很多人关注，属于另一个用户的 followed
    };


    return User;
}

