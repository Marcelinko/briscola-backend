const {BriscolaEngine} = require('../engines/Briscola/BriscolaEngine');
const engines = {
    1: new BriscolaEngine(),
    //2: new ChessEngine(),
};

module.exports = engines;
