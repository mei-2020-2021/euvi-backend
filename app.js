var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();
var router = express.Router();
var routes = require('./routes/_index');
var sequelize = require('./sequelize/_index');
var models = require('./sequelize/models/_index');
const init = require('./routes/init.handler')

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var database = async () => {
  try {
    await sequelize.authenticate();
    console.info('Connection has been established successfully.');
    await sequelize.sync({force: true});
    await init();
    console.info('All models were synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

database();

router.use('/', routes);
app.use(router);

module.exports = app;
