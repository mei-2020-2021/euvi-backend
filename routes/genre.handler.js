const express = require('express');

const router = express.Router();
const Genre = require('../sequelize/models/genre.model');

router.get('/', async (req, res) => {
  const genres = await Genre.findAll();
  return res.status(200).json(genres.map((genre) => ({ id: genre.Id, name: genre.Value })));
});

module.exports = router;
