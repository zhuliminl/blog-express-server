module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        passwordHash: DataTypes.STRING
    }, {
        timestamps: false
    });

    /**
     * 定义实体和实体之间的建立联系的类方法
     * @param models 模型
     */
    User.associate = (models) => {
        User.hasMany(models.Post, { as: 'articles', foreignKey: 'author_id' })
    };


    return User;
}

