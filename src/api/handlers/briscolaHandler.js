const roomUtils = require("../utils/roomUtils");
const briscolaUtils = require("../utils/briscolaUtils");
const SystemMessage = require("../models/Room/SystemMessage");

const isCallbackFunction = (cb) => {
  return typeof cb === "function";
};

module.exports = (io, socket) => {
  const startGame = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId } = data;
    const room = roomUtils.getRoomById(roomId);

    if (!roomUtils.roomExists(room))
      return cb({ error: SocketErrors.ROOM_NO_LONGER_EXISTS });
    if (!roomUtils.isUserInRoom(room, socket.id)) return;
    if (!roomUtils.isUserOwner(room, socket.id)) return;
    if (!roomUtils.isEnoughPlayers(room))
      return cb({ error: SocketErrors.NOT_ENOUGH_PLAYERS });
    room.startGame();
    const { game } = room;
    io.to(roomId).emit("briscola:game", game.toJSON());
    game.players.forEach((player) => {
      io.to(player.id).emit("briscola:hand", player.hand);
    });
    cb(null);
  };

  //HANDLE IF SOMEONE LEAVES THE ROOM IN THE MIDDLE OF THE GAME
  //ADD SHUFFLE TEAMS
  //HANDLE IF THERE ARE 4 PLAYERS (4 players show oponnents cards on last deal)
  const playCard = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, card } = data;
    const room = roomUtils.getRoomById(roomId);

    if (!roomUtils.roomExists(room))
      return cb({ error: SocketErrors.ROOM_NO_LONGER_EXISTS });
    if (!roomUtils.isUserInRoom(room, socket.id)) return;
    if (!briscolaUtils.hasGameStarted(room)) return;
    if (!briscolaUtils.isYourTurn(room, socket.id))
      return cb({ error: SocketErrors.NOT_YOUR_TURN });
    const { game } = room;
    game.playCard(socket.id, card);
    if (game.isGameOver()) {
      io.to(roomId).emit(
        "room:newMessage",
        new SystemMessage(game.determineGameWinner(), "win")
      );
    }
    io.to(roomId).emit("briscola:round", game.getRound());
    io.to(game.getTurn()).emit("briscola:turn", "Your turn");
    io.to(roomId).emit("briscola:game", game.toJSON());
    game.players.forEach((player) => {
      io.to(player.id).emit("briscola:hand", game.getPlayerHand(player.id));
    });
    if (game.isLastPlayerOfRound()) {
      setTimeout(() => {
        io.to(roomId).emit("briscola:round", game.getRound());
        game.players.forEach((player) => {
          io.to(player.id).emit("briscola:hand", game.getPlayerHand(player.id));
        });
      }, 2000);
    }
    cb(null);
  };

  socket.on("briscola:start", startGame);
  socket.on("briscola:playCard", playCard);
};
