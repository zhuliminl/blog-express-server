const Sequelize = require('sequelize');
const initData = require('./initData');

const sequelize = new Sequelize(
    'restful_blog',
    'root',
    process.env.MAIL_PASSWORD.slice(0,6),
    {
        host: 'localhost',
        dialect: 'mysql',
    },
);

const db = {
    User: sequelize.import('./User'),
    Post: sequelize.import('./Post'),
    Comment: sequelize.import('./Comment')
};

Object.keys(db).forEach((modelName) => {
    if('associate' in db[modelName]) {      // 表中有该方法，那就执行它
        db[modelName].associate(db);
    }
})

db.sequelize = sequelize;

// 初始化虚假数据
initData(db);

module.exports = db;
