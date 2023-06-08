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

const isNicknameValid = (nickname) => {
  return nickname.length >= 2 && nickname.length <= 15;
};

const createNewRoom = (socketId) => {
  const roomId = generateRoomId();
  const room = new Room(roomId, socketId);
  rooms[roomId] = room;
  return room;
};

const getRoomById = (roomId) => {
  return rooms[roomId];
};

const deleteRoom = (roomId) => {
  delete rooms[roomId];
};

const getRooms = () => {
  return rooms;
};

//If you are trying to join a room that you are not in
const roomExists = (room) => {
  if (!room) return false;
  return true;
};

//Check if you are the owner of the room
const isUserOwner = (room, socketId) => {
  if (room.owner !== socketId) return false;
  return true;
};

//Check if there are enough players to start the game
const isEnoughPlayers = (room) => {
  if (room.users.length < 2) return false;
  return true;
};

//Check if you are already in the room
const isUserInRoom = (room, socketId, uuid) => {
  if (room.hasUserSocket(socketId) || room.hasUserUUID(uuid)) return true;
  return false;
};

const isUserKicked = (room, uuid) => {
  if (room.isUserKicked(uuid)) return true;
  return false;
};

const isRoomFull = (room) => {
  if (room.users.length === 4) return true;
  return false;
};

const isGameInProgress = (room) => {
  if (room.game.status === "playing") return true;
  return false;
};

const changeOwner = (room, socketId) => {
  if (room.users.length === 0 || room.owner !== socketId) return;
  const newOwner = room.users[0].id;
  room.setOwner(newOwner);
  return newOwner;
};

const leaveRoom = (room, socketId) => {
  const { game } = room;
  game.reset();
  room.removeUser(socketId);
};

const kickUser = (room, socketId) => {
  const { game } = room;
  game.reset();
  room.kickUser(socketId);
  console.log(room.game);
};

module.exports = {
  createNewRoom,
  getRoomById,
  deleteRoom,
  getRooms,
  isNicknameValid,
  roomExists,
  isUserOwner,
  isEnoughPlayers,
  isUserInRoom,
  isUserKicked,
  isRoomFull,
  isGameInProgress,
  changeOwner,
  leaveRoom,
  kickUser,
};
