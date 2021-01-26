const express = require('express');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');
const User = require('../sequelize/models/user.model');
const Content = require('../sequelize/models/content.model');
const ContentStatus = require('../sequelize/models/contentStatus.model');
const SeriesEpisode = require('../sequelize/models/seriesEpisode.model');
const StatusType = require('../sequelize/models/statusType.model');
const Genre = require('../sequelize/models/genre.model');
const sequelize = require('../sequelize/_index');

const router = express.Router();

router.get('/', async (req, res) => {
  const content = await Content.findByPk(req.query.id, { include: { all: true, nested: false } });
  return res.status(200).json(content);
});

router.get('/search', async (req, res) => {
  const genres = req.query.genre;
  const { type } = req.query;
  const { title } = req.query;

  const allcontent = [];

  if (title && genres && type) {
    var array = genres.split(',');
    var lista = [];
    array.forEach((element) => {
      lista.push({ Value: element });
    });
    var typeId = 0;
    if (type == 'movie') {
      typeId = 1;
    } else {
      typeId = 2;
    }
    const content = await Content.findAll({
      where: {
        Title: title,
        ContentTypeId: typeId,
      },
      include: [
        {
          model: Genre,
          where: {
            [Op.or]: lista,
          },
        },
      ],
    });
    allcontent.push(content);
  } else if (title && genres) {
    var array = genres.split(',');
    var lista = [];
    array.forEach((element) => {
      lista.push({ Value: element });
    });
    const content = await Content.findAll({
      where: {
        Title: title,
      },
      include: [
        {
          model: Genre,
          where: {
            [Op.or]: lista,
          },
        },
      ],
    });
    allcontent.push(content);
  } else if (title && type) {
    var typeId = 0;
    if (type == 'movie') {
      typeId = 1;
    } else {
      typeId = 2;
    }
    const content = await Content.findAll({
      where: {
        Title: title,
        ContentTypeId: typeId,
      },
    });
    allcontent.push(content);
  } else if (type && genres) {
    var array = genres.split(',');
    var lista = [];
    array.forEach((element) => {
      lista.push({ Value: element });
    });
    var typeId = 0;
    if (type == 'movie') {
      typeId = 1;
    } else {
      typeId = 2;
    }
    const content = await Content.findAll({
      where: {
        ContentTypeId: typeId,
      },
      include: [
        {
          model: Genre,
          where: {
            [Op.or]: lista,
          },
        },
      ],
    });
    allcontent.push(content);
  } else if (title) {
    const contentTitle = await Content.findAll({
      where: {
        Title: title,
      },
    });
    allcontent.push(contentTitle);
  } else if (type) {
    var typeId = 0;
    if (type == 'movie') {
      typeId = 1;
    } else {
      typeId = 2;
    }
    const contentType = await Content.findAll({
      where: {
        ContentTypeId: typeId,
      },
    });
    allcontent.push(contentType);
  } else if (genres) {
    var array = genres.split(',');
    var lista = [];
    array.forEach((element) => {
      lista.push({ Value: element });
    });
    const contentGenre = await Content.findAll({
      include: [
        {
          model: Genre,
          where: {
            [Op.or]: lista,
          },
        },
      ],
    });
    allcontent.push(contentGenre);
  }

  return res.status(200).json(allcontent);
});

router.get('/watchlist', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const [watchlist] = await sequelize.query(
    `SELECT Contents.* from Users LEFT JOIN ContentStatus ON Users.Id = ContentStatus.UserId LEFT JOIN Contents ON ContentStatus.ContentId = Contents.Id WHERE ContentTypeId != 3 AND ContentStatus.StatusTypeId = ${
      req.query.statusTypeId
    } AND Users.Id = ${
      user.Id}`,
  );
  return res.status(200).json(watchlist);
});

router.post('/createStatus', async (req, res) => {
  const statusId = parseInt(req.query.statusTypeId);
  const userUID = req.query.uid;
  const { contentId } = req.query;
  const epIdList = [];
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;
  const statusType = await StatusType.findOne({
    where: {
      Id: statusId,
    },
  });

  const user = await User.findOne({
    where: {
      Uid: userUID,
    },
  });

  await Content.findOne({
    where: {
      Id: contentId,
    },
  }).then(async (content) => {
    if (content.ContentTypeId == 1) {
      if (statusId == 2) {
        await user.addWatchlistContent(content, { through: { StatusTypeId: statusId, WatchedAt: dateTime } });
      } else {
        await user.addWatchlistContent(content, { through: { StatusTypeId: statusId } });
      }
      const contentStatus = await ContentStatus.update(
        { StatusTypeId: statusId },
        {
          where: {
            ContentId: contentId,
            UserId: user.Id,
          },
        },
      );
    } else if (content.ContentTypeId == 2) {
      const allEpisodes = await SeriesEpisode.findAll({
        where: {
          SeriesId: contentId,
        },
      });

      for (var i = 0; i < allEpisodes.length; i++) {
        epIdList.push(allEpisodes[i].EpisodeId);
      }
      console.log(epIdList.length);
      for (var i = 0; i < epIdList.length; i++) {
        await Content.findOne({
          where: {
            Id: epIdList[i],
          },
        }).then(async (episodes) => {
          if (statusId == 2) {
            await user.addWatchlistContent(content, { through: { StatusTypeId: statusId, WatchedAt: dateTime } });
            await user.addWatchlistContent(episodes, { through: { StatusTypeId: statusId, WatchedAt: dateTime } });
          } else {
            await user.addWatchlistContent(content, { through: { StatusTypeId: statusId } });
            await user.addWatchlistContent(episodes, { through: { StatusTypeId: statusId } });
          }
        });
        const contentStatus = await ContentStatus.update(
          { StatusTypeId: statusId },
          {
            where: {
              ContentId: epIdList[i],
              UserId: user.Id,
            },
          },
        );
        const contentStatus1 = await ContentStatus.update(
          { StatusTypeId: 2, WatchedAt: dateTime },
          {
            where: {
              ContentId: epIdList[0],
              UserId: user.Id,
            },
          },
        );
      }
    }
  });
  return res.status(200).json(contentId);
});

router.get('/feedback', async (req, res) => {
  const userUid = req.query.uid;
  const { contentId } = req.query;

  const user = await User.findOne({
    where: {
      Uid: userUid,
    },
  });
  const contentFeedback = await ContentStatus.findOne({
    where: {
      ContentId: contentId,
      UserId: user.Id,
    },
    attributes: ['Feedback'],
  });
  if (contentFeedback) {
    return res.status(200).json(contentFeedback.Feedback);
  }
  return res.status(200).json(null);
});

router.post('/feedback', async (req, res) => {
  const userUid = req.query.uid;
  const { contentId } = req.query;
  const { feedback } = req.query;

  const user = await User.findOne({
    where: {
      Uid: userUid,
    },
  });
  const contentFeedback = await ContentStatus.update(
    { Feedback: feedback },
    {
      where: {
        ContentId: contentId,
        UserId: user.Id,
      },
    },
  );
  return res.status(200).json(contentFeedback);
});

router.post('/updateStatusType', async (req, res) => {
  const userUid = req.query.uid;
  const { contentId } = req.query;
  const contentStatusTypeId = req.query.StatusTypeId;
  const today = new Date();
  const date = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  const dateTime = `${date} ${time}`;

  const user = await User.findOne({
    where: {
      Uid: userUid,
    },
  });

  const content = await Content.findOne({
    where: {
      Id: contentId,
    },
  });

  if (contentStatusTypeId == 2) {
    const contentStatus = await ContentStatus.update(
      { WatchedAt: dateTime },
      {
        where: {
          ContentId: contentId,
          UserId: user.Id,
        },
      },
    );
    const contentStatus1 = await ContentStatus.update(
      { StatusTypeId: contentStatusTypeId },
      {
        where: {
          ContentId: contentId,
          UserId: user.Id,
        },
      },
    );
    return res.status(200).json(contentStatus);
  }
  const contentStatus = await ContentStatus.update(
    { StatusTypeId: contentStatusTypeId },
    {
      where: {
        ContentId: contentId,
        UserId: user.Id,
      },
    },
  );
  return res.status(200).json(contentStatusTypeId);
});

router.get('/seenAt', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const contentStatus = await ContentStatus.findOne({
    where: {
      ContentId: req.query.contentId,
      UserId: user.Id,
    },
  });
  return res.status(200).json(contentStatus ? contentStatus.WatchedAt : null);
});

router.get('/contentStatus', async (req, res) => {
  const user = await User.findOne({ where: { Uid: req.query.uid } });
  const contentStatus = await ContentStatus.findOne({
    where: {
      ContentId: req.query.contentId,
      UserId: user.Id,
    },
  });
  return res.status(200).json(contentStatus ? contentStatus.StatusTypeId : null);
});

router.get('/trendingNow', async (req, res) => {
  const trendingNow = await Content.findAll({
    // order: Sequelize.literal('rand()'),
    include: { all: true, nested: false },
    where: { ContentTypeId: { [Op.ne]: 3 } },
  });
  return res.status(200).json(trendingNow);
});

router.get('/topMovies', async (req, res) => {
  const topMovies = await Content.findAll({
    // order: Sequelize.literal('rand()'),
    include: { all: true, nested: false },
    where: { ContentTypeId: 1 },
  });
  return res.status(200).json(topMovies);
});

router.get('/topSeries', async (req, res) => {
  const topSeries = await Content.findAll({
    // order: Sequelize.literal('rand()'),
    include: { all: true, nested: false },
    where: { ContentTypeId: 2 },
  });
  return res.status(200).json(topSeries);
});

router.get('/getSeriesInfo', async (req, res) => {
  const { serieId } = req.query;
  const list = [];
  const allInfo = [];
  const duration = await Content.findOne({
    where: {
      Id: serieId,
    },
    attributes: ['Duration'],
  });

  const allContent = await SeriesEpisode.findAll({
    where: {
      SeriesId: serieId,
    },
    attributes: ['SeasonNumber', 'EpisodeNumber'],
  });
  list.push(duration);
  list.push(allContent);
  const seasons = { Seasons: list[1][list[1].length - 1].SeasonNumber };
  allInfo.push(list[0]);
  allInfo.push(seasons);
  return res.status(200).json(allInfo);
});

router.get('/progress', async (req, res) => {
  const userUid = req.query.uid;
  const { contentId } = req.query;
  const list = [];
  let count = 0;
  let percentage = 0;
  const allEps = await SeriesEpisode.findAll({
    where: {
      SeriesId: contentId,
    },
  });
  const user = await User.findOne({
    where: {
      Uid: userUid,
    },
  });

  for (var i = 0; i < allEps.length; i++) {
    list.push(allEps[i].EpisodeId);
  }

  for (var i = 0; i < list.length; i++) {
    console.log(list[i]);
    console.log(user.Id);
    await ContentStatus.findOne({
      where: {
        ContentId: list[i],
        UserId: user.Id,
      },
    }).then((allEpsStatus) => {
      if (allEpsStatus.StatusTypeId == 2) {
        count++;
      }
    });
  }
  percentage = (count * 100) / list.length;

  console.log(list);
  return res.status(200).json(percentage);
});

router.get('/currentSeasonEpisodes', async (req, res) => {
  const userUid = req.query.uid;
  const { contentId } = req.query;
  const list = [];
  let epId = 0;
  let greatestEp = 0;
  let final = {};

  try {
    const allEps = await SeriesEpisode.findAll({
      where: {
        SeriesId: contentId,
      },
    });
    const user = await User.findOne({
      where: {
        Uid: userUid,
      },
    });

    for (var i = 0; i < allEps.length; i++) {
      list.push(allEps[i].EpisodeId);
    }

    for (var i = 0; i < list.length; i++) {
      await ContentStatus.findOne({
        where: {
          ContentId: list[i],
          UserId: user.Id,
        },
      }).then(async (allEpsStatus) => {
        if (allEpsStatus.StatusTypeId == 2 && allEpsStatus.ContentId > greatestEp) {
          const episodeNumber = await SeriesEpisode.findOne({
            where: {
              EpisodeId: allEpsStatus.ContentId,
            },
          });
          greatestEp = episodeNumber.EpisodeNumber;
          epId = allEpsStatus.ContentId;
        }
      });
    }
    console.log(epId);
    await SeriesEpisode.findAll({
      where: {
        EpisodeId: epId,
      },
      attributes: ['SeasonNumber'],
    }).then((allEpsSeason) => {
      final = { Episode: greatestEp, Season: allEpsSeason[0].SeasonNumber };
    });
  } catch (error) {
    return res.status(200).json([]);
  }
  return res.status(200).json(final);
});

module.exports = router;
