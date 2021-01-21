const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  host: 'ec2-46-137-100-204.eu-west-1.compute.amazonaws.com',
  port: '5432',
  database: 'd2lkif2rh31r0q',
  username: 'ympcpnywcjqdlb',
  password: '3ac2d9d159638c0f56662b5eeacd9686c948928b07691b57b524c0f7a6e2b5fe',
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;
