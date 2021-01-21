const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();
const router = express.Router();
const routes = require('./routes/_index');
const sequelize = require('./sequelize/_index');
require('./sequelize/models/_index');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const database = async () => {
  await sequelize.authenticate();
  await sequelize.sync();
};

database();

router.use('/', routes);
app.use(router);

module.exports = app;
