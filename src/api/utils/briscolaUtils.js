const hasGameStarted = (room) => {
  if (!room.game) return false;
  return true;
};

const isYourTurn = (room, socketId) => {
  if (!room.game.isYourTurn(socketId)) return false;
  return true;
};

module.exports = {
  hasGameStarted,
  isYourTurn,
};
