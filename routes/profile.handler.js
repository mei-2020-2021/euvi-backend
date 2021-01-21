const express = require('express');

const router = express.Router();
const ContentStatus = require('../sequelize/models/contentStatus.model');
const User = require('../sequelize/models/user.model');
const Content = require('../sequelize/models/content.model');
const Genre = require('../sequelize/models/genre.model');

router.get('/', async (req, res) => {
  const userId = req.query.UserId;
  const statusType = req.query.StatusTypeId;
  if (userId) {
    const contentIds = await ContentStatus.findAll({
      where: {
        UserId: userId,
        StatusTypeId: statusType,
      },
      attributes: ['ContentId'],
    });
    return res.status(200).json(contentIds);
  }
});

router.get('/categories', async (req, res) => {
  const userUid = req.query.uid;
  const uIdList = [];
  const genreList = [];
  let animation = 0;
  let comedy = 0;
  let family = 0;
  let sports = 0;
  let drama = 0;
  let romance = 0;
  let scifi = 0;
  let history = 0;
  let thriller = 0;
  let mystery = 0;
  let action = 0;
  let crime = 0;
  let horror = 0;

  const user = await User.findOne({
    where: {
      Uid: userUid,
    },
  });

  for (var i = 0; i < uIdList.length; i++) {
    await Genre.findAll({
      include: [{
        model: Content,
        where: {
          Id: uIdList[i],
        },
      }],
    }).then((genre) => {
      for (let x = 0; x < genre.length; x++) {
        genreList.push(genre[x].Value);
      }
    });
  }

  for (var i = 0; i < genreList.length; i++) {
    if (genreList[i] == 'Animation') {
      animation += 1;
    } else if (genreList[i] == 'Adventure') {
    } else if (genreList[i] == 'Comedy') {
      comedy += 1;
    } else if (genreList[i] == 'Family') {
      family += 1;
    } else if (genreList[i] == 'Sports') {
      sports += 1;
    } else if (genreList[i] == 'Drama') {
      drama += 1;
    } else if (genreList[i] == 'Romance') {
      romance += 1;
    } else if (genreList[i] == 'SciFi') {
      scifi += 1;
    } else if (genreList[i] == 'History') {
      history += 1;
    } else if (genreList[i] == 'Thriller') {
      thriller += 1;
    } else if (genreList[i] == 'Mystery') {
      mystery += 1;
    } else if (genreList[i] == 'Action') {
      action += 1;
    } else if (genreList[i] == 'Crime') {
      crime += 1;
    } else if (genreList[i] == 'Horror') {
      horror += 1;
    }
  }

  const allCategories = {
    Animation: animation, Comedy: comedy, Family: family, Sports: sports, Drama: drama, Romance: romance, Scifi: scifi, History: history, Thriller: thriller, Mystery: mystery, Action: action, Crime: crime, Horror: horror,
  };
  return res.status(200).json(allCategories);
});

router.get('/totalTime', async (req, res) => {
  const userUid = req.query.uid;
  let timeWatched = 0;
  const user = await User.findOne({
    where: {
      Uid: userUid,
    },
  });

  const allIds = await ContentStatus.findAll({
    where: {
      UserId: user.Id,
    },
  });

  for (i = 0; i < allIds.length; i++) {
    const allContent = await Content.findOne({
      where: {
        Id: allIds[i].ContentId,
      },
    });
    timeWatched += allContent.Duration;
  }
  return res.status(200).json(timeWatched);
});

module.exports = router;
