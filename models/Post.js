module.exports =  (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: DataTypes.STRING,
        body: DataTypes.TEXT,
    }, {
        timestamps: false
    });

    Post.associate = (models) => {
        Post.hasMany(models.Comment, { as: 'comments', foreignKey: 'post_id' });
    };

    return Post;
}

