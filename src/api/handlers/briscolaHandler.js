const roomUtils = require("../utils/roomUtils");

const isCallbackFunction = (cb) => {
  return typeof cb === "function";
};

module.exports = (io, socket) => {
  const startGame = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId } = data;
    try {
      const room = roomUtils.roomCheckOwner(roomId, socket.id);
      const { game } = room;
      game.startGame(roomId, room.users, io);
      cb(null);
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const stopGame = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId } = data;
    try {
      const room = roomUtils.roomCheckOwner(roomId, socket.id);
      const { game } = room;
      game.stopGame();
      io.to(roomId).emit("briscola:stopGame");
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const playCard = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, card } = data;
    try {
      const room = roomUtils.roomCheck(roomId, socket.id);
      const { game } = room;
      game.playCard(roomId, card, socket.id, io);
      cb(null);
    } catch (err) {
      cb({ error: err.message });
    }
  };

  socket.on("briscola:start", startGame);
  socket.on("briscola:stop", stopGame);
  socket.on("briscola:playCard", playCard);
};
