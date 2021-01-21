const express = require('express');
const ContentStatus = require('../sequelize/models/contentStatus.model');
const User = require('../sequelize/models/user.model');
const sequelize = require('../sequelize/_index');

const router = express.Router();

router.get('/', async (req, res) => {
  const contentIds = await ContentStatus.findAll({
    where: {
      UserId: req.query.UserId,
      StatusTypeId: req.query.StatusTypeId,
    },
    attributes: ['ContentId'],
  });
  return res.status(200).json(contentIds);
});

router.get('/categories', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const [categories] = await sequelize.query(
    `SELECT Genres.Value as 'Genre', count(Genres.Value) as 'Count' FROM ContentGenre LEFT JOIN Genres ON ContentGenre.GenreId = Genres.Id LEFT JOIN ContentStatus ON ContentStatus.ContentId = ContentGenre.ContentId LEFT JOIN Contents ON ContentStatus.ContentId = Contents.Id WHERE ContentStatus.UserId = ${user.Id} AND ContentStatus.StatusTypeId != 3 AND Contents.ContentTypeId != 3 GROUP BY Genres.Value`
    ,
  );
  return res.status(200).json(categories);
});

router.get('/watchTime', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const [watchTime] = await sequelize.query(
    `SELECT sum(Contents.Duration) as 'WatchTime' FROM ContentStatus LEFT JOIN Contents ON ContentStatus.ContentId = Contents.Id WHERE ContentStatus.UserId = ${user.Id} AND ContentStatus.StatusTypeId = 2 AND Contents.ContentTypeId != 2`
    ,
  );
  return res.status(200).json(watchTime);
});

module.exports = router;
