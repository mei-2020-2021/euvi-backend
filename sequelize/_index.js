const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: '94.46.15.180',
  port: '3306',
  database: 'experiment',
  username: 'experiment',
  password: 'raafa179',
  dialect: 'mariadb',
  logging: false
});

module.exports = sequelize;