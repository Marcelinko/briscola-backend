const games = require("../../config/games");
const engines = require("../engines/Engines");
const Room = require("../models/Room/Room");

const rooms = {};

const generateRoomId = (length = 8) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const getGameById = (gameId) => {
  const id = parseInt(gameId);
  const game = games.find((game) => game.id === id);
  return game ? game : games.find((game) => game.id === 1);
};

const isNicknameValid = (nickname) => {
  return nickname.length >= 2 && nickname.length <= 15;
};

const createNewRoom = (gameId, socketId) => {
  const roomId = generateRoomId();
  const game = getGameById(gameId);
  const engine = engines[gameId];
  const room = new Room(roomId, socketId, game, engine);
  rooms[roomId] = room;
  return room;
};

const getRoomById = (roomId) => {
  return rooms[roomId];
};

const deleteRoom = (roomId) => {
  delete rooms[roomId];
  console.log(`Room ${roomId} deleted`);
};

const getRooms = () => {
  return rooms;
};

module.exports = {
  createNewRoom,
  getRoomById,
  deleteRoom,
  getRooms,
  isNicknameValid,
};
