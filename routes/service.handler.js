const express = require('express');
const User = require('../sequelize/models/user.model');
const Service = require('../sequelize/models/service.model');
const sequelize = require('../sequelize/_index');

const router = express.Router();

router.get('/addService', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const service = await Service.findOne({ where: { Id: req.query.serviceId } });
  await user.addServices(service);
  return res.status(200).send();
});

router.get('/removeService', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const service = await Service.findOne({ where: { Id: req.query.serviceId } });
  await user.removeServices(service);
  return res.status(200).send();
});

router.get('/otherServices', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const [otherServices] = await sequelize.query(
    `SELECT * FROM SERVICES WHERE SERVICES.ID NOT IN (SELECT SERVICES.ID FROM USERS, SERVICES, USERSERVICE WHERE USERS.ID = ${user.Id} AND USERSERVICE.USERID = USERS.ID AND USERSERVICE.SERVICEID = SERVICES.ID)`,
  );
  return res.status(200).json(otherServices);
});

module.exports = router;
