module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment', {
        body: DataTypes.TEXT,
    }, {
        timestamps: false
    });

    Comment.associate = (models) => {
        Comment.belongsTo(models.User, { as: 'creator', foreignKey: 'owner_id' });
    };

    return Comment;
}


