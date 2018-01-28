const db = require('../../models');
const { User, Post, Comment } = db;

exports.getUser = function(req, res) {
    User.findAll()
        .then(users => {
            res.send(users)
        })
        .catch(err => { console.log(err) })
}

exports.getFirstUser = function(req, res) {
    User.findById(1, {
        include: [{
            model: Post,
            as: 'articles'
        }]
    })
        .then(user => {
            res.send(user)
        })
        .catch(err => { console.log(err) })
}

exports.getPost = function(req, res) {
    Post.findAll()
        .then(posts => {
            res.send(posts)
        })
        .catch(err => { console.log(err) })
}

exports.getComment = function(req, res) {
    Comment.findAll()
        .then(comments => {
            res.send(comments)
        })
        .catch(err => { console.log(err) })
}
