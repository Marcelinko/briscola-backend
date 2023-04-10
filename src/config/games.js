const Game = require('../api/models/Game')
const games = [
   new Game(1, 'Briscola', 'https://cf.geekdo-images.com/EGJMBcAbJZ3L7tMc4G9x9Q__imagepagezoom/img/l7k-oNT4c7yVMznWDzHLF7vdIaU=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic71809.jpg', 'Popular Italian trick-taking card game'),
   new Game(2, 'Chess', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/ChessSet.jpg/800px-ChessSet.jpg', 'Strategy board game for two players'),
];
module.exports = games;