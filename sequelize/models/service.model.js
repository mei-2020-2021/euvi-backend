const Sequelize = require('sequelize');
const sequelize = require('../_index');
const Content = require('./content.model');
const User = require('./user.model');

class Service extends Sequelize.Model {}

Service.init(
  {
    Id: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    Value: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    IconUrl: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Service',
  },
);

Service.belongsToMany(Content, { through: 'ContentService' });
Content.belongsToMany(Service, { through: 'ContentService' });
Service.belongsToMany(User, { as: 'UserServices', through: 'UserService' });
User.belongsToMany(Service, { as: 'ServiceUsers', through: 'UserService' });

module.exports = Service;
