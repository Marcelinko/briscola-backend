const { getGames } = require("../services/games");

const getAllGames = (req, res) => {
    const games = getGames();
    res.json(games);
};

module.exports = {
    getAllGames
};