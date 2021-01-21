const express = require('express');
const User = require('../sequelize/models/user.model');
const Service = require('../sequelize/models/service.model');

const router = express.Router();
const sequelize = require('../sequelize/_index');

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
  const user = await User.findOne({ where: { Uid: req.query.uid }, include: { model: Service, as: 'UserServices' } });
  const [notSubscribed] = await sequelize.query(
    `SELECT * FROM SERVICES WHERE SERVICES.ID NOT IN (SELECT SERVICES.ID FROM USERS, SERVICES, USERSERVICES WHERE USERS.ID = ${user.Id} AND USERSERVICES.USERID = USERS.ID AND USERSERVICES.SERVICEID = SERVICES.ID)`,
  );
  return res.status(200).json(notSubscribed);
});

module.exports = router;
