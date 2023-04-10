const router = require('express').Router();

const gameController = require('../controllers/gameController');

router.get('/games/all', gameController.getAllGames);

module.exports = router;