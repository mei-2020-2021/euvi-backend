const express = require('express');
const User = require('../sequelize/models/user.model');

const router = express.Router();
const sequelize = require('../sequelize/_index');
const Service = require('../sequelize/models/service.model');

router.post('/', async (req, res) => {
  const newUser = await User.create({
    Uid: req.body.Uid,
    FirstName: req.body.FirstName,
    LastName: req.body.LastName,
    BirthDate: req.body.BirthDate,
    Email: req.body.Email,
  });
  return res.status(200).json(newUser);
});

router.get('/', async (req, res) => {
  const { id } = req.query;
  const { uid } = req.query;

  if (id) {
    const user = await User.findByPk(id);
    return res.status(200).json(user);
  } if (uid) {
    const user = await User.findOne({
      include: Service,
      where: {
        Uid: uid,
      },
    });
    return res.status(200).json(user);
  }
  const allUsers = await User.findAndCountAll();
  return res.status(200).json(allUsers);
});

router.get('/friends', async (req, res) => {
  const { uid } = req.query;
  const user = await User.findOne({
    include: Service,
    where: {
      Uid: uid,
    },
  });

  const [notfriends] = await sequelize.query(
    `SELECT * FROM USERS WHERE USERS.ID NOT IN (SELECT FRIENDSHIPS.USERID FROM FRIENDSHIPS WHERE FRIENDSHIPS.FRIENDID=${user.Id}) AND USERS.ID<>${user.Id}`,
  );
  return res.status(200).json(notfriends);
});

module.exports = router;
