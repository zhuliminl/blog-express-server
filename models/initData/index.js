const fs = require('fs');
const path = require('path');
const async = require('async');

module.exports = function(db) {
    const { User, sequelize } = db;
    async.waterfall([
        // 读取文件，并转换成对象
        function(callback) {
            fs.readFile(path.join(__dirname, '/fake.json'), (err, data) => {
                if(err) { console.log(err) };
                data = JSON.parse(data.toString());
                callback(null, data);                       // 把数据流传递下去
            })
        },
        // 创建数据表
        function(data, callback) {                          // 接受数据
            sequelize.sync({ force: true })
                .then(() => {
                    callback(null, data);                    // 这里就感觉很奇怪，因为这里 data 不做任何事情
                })
                .catch(err => { console.log(err) });
        },
        // 添加初始用户
        function(data, callback) {
            const { users, posts, comments } = data;

            Promise.all(users.map(user => {
                user.passwordHash = user.password;              // 勉强之举
                return User
                    .create(user)
                    .then(user => user)
                    .catch(err => { console.log('创建用户失败', err) });
            }))
                .then(users => {
                    callback(null, users, posts, comments);              // 把数据对象摊开继续往下传,不过要注意这里 user 已经是数据库对象了。其他的还不是
                })
                .catch(err => { console.log(err) });

        },
        // 给第一个用户添加一些文章和评论，还要把评论附属给第一个用户
        function(users, posts, comments, callback) {
            const firstUser = users[0];

            Promise.all(posts.map(post => {
                return firstUser
                    .createArticle(post)
                    .then(post => post)
                    .catch(err => console.log(err));
            }))
                .then(posts => {
                    const firstPost = posts[0];
                    firstPost.createComment(comments[1])
                        .then(comment => {
                            callback(null, firstUser, comment);
                        })
                    // 在这里添加也行
                    firstPost.createComment(comments[2])
                        .then(comment => {
                            // console.log(comment.createCreator({ name: 'foo', email: 'foo@gmail.com', 'passwordHash': 'foo'}))   // create 是按普通对象添加
                            comment.setCreator(firstUser)
                        })
                })
                .catch(err => console.log(err));
        },
        // 给第一个用户的第一个文章添加一些评论
        function(firstUser, comment, callback) {
            comment.setCreator(firstUser)
            // console.log(comment.setCreator())
            // console.log(firstUser.email)
        }
    ])
}
