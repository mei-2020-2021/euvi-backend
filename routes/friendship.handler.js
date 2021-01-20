const express = require('express');
const User = require('../sequelize/models/user.model');
const router = express.Router();
const sequelize = require('../sequelize/_index');
const { Op } = require('sequelize');
const Friendship = require('../sequelize/models/friendship.model');

router.get('/', async function (req, res) {
  const id = req.query.userId

  const friendships = await Friendship.findAll({
    where: {
      UserId: id,
    }
  })
  const friendsIds = friendships.map(friendship => {return({Id: friendship.dataValues.FriendId})})
  const friendsList = await User.findAll(
    {
      where: {
        [Op.or]: friendsIds
      }
    }
  )
  return res.status(200).json(friendsList);
});

router.post('/friendship', async function (req, res) {
  const userUid = req.query.uid;
  const friendUid = req.query.frienduid;

  var all = []

  const getUser = await User.findOne({
    where: {
      Uid: userUid
    }
  }) 
  const getFriend = await User.findOne({
    where: {
      Uid: friendUid
    }
  })
  all.push(getUser)
  all.push(getFriend)

  await getUser.addFriend(getFriend)

  res.status(200).json(all)
});



module.exports = router;