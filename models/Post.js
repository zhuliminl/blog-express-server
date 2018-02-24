module.exports =  (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        title: DataTypes.STRING,
        body: DataTypes.TEXT,
        slug: DataTypes.TEXT,
    }, {
        // timestamps: false,
        hooks: {
            beforeValidate: function(post) {
                post.slug = setSlug(post.body);
            }
        }
    });

    Post.associate = (models) => {
        Post.hasMany(models.Comment, { as: 'comments', foreignKey: 'post_id' });
    };

    return Post;
}


function setSlug(text) {
    return text.match(/^[^.。"“！\!\?？]+/g)[0];                 // 暂时就这个正则吧
}
