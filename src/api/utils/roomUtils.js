const Room = require("../models/Room/Room");
const User = require("../models/Room/User");
const RoomError = require("../errors/RoomError");
const SocketErrors = require("../errors/SocketErrors");

const rooms = {};

//TODO: Collision check
const generateRoomId = (length = 8) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let roomId = "";
  for (let i = 0; i < length; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return roomId;
};

//Check if nickname is valid
const isNicknameValid = (nickname) =>
  nickname.length >= 2 && nickname.length <= 15;
const isAvatarValid = (id) => id >= 1 && id <= 8;
//Check if nickname is in use
const isNicknameInUse = (room, nickname) =>
  room.users.some((user) => user.nickname === nickname);
//Get all rooms
const getRooms = () => rooms;
//Get room by id
const getRoomById = (roomId) => rooms[roomId];
//Change room owner
const changeRoomOwner = (room, socketId) => {
  if (room.users.length === 0 || room.owner !== socketId) {
    return null;
  }
  const newOwner = room.users[0].id;
  room.setOwner(newOwner);
  return newOwner;
};
//Delete specific room if it exists
const deleteRoom = (roomId) => {
  if (rooms.hasOwnProperty(roomId)) {
    delete rooms[roomId];
  }
};

//Check if room exists
const roomExists = (room) => !!room;
//Check if user is in room
const isUserInRoom = (room, socketId, uuid) =>
  !!room.getUserBySocket(socketId) || !!room.getUserByUUID(uuid);
//Check if user is kicked
const isUserKicked = (room, uuid) => room.isUserKicked(uuid);
//Check if room is full
const isRoomFull = (room) => room.users.length === 4;
//Check if there are enough players to start the game
//Check if there is game in progress
const isGameInProgress = (room) => room.game.gameActive;
//Check if user is room owner
const isUserRoomOwner = (room, socketId) => room.owner === socketId;

const createRoom = (socketId, uuid, nickname, avatar) => {
  if (!isNicknameValid(nickname)) {
    throw new RoomError(SocketErrors.INVALID_NICKNAME, "INVALID_NICKNAME");
  }
  if (!isAvatarValid(avatar)) {
    throw new RoomError(SocketErrors.INVALID_AVATAR, "INVALID_AVATAR");
  }
  const roomId = generateRoomId();
  const room = new Room(roomId, socketId);
  rooms[roomId] = room;
  room.addUser(new User(socketId, uuid, nickname, avatar));
  return { roomId, room };
};

const joinRoom = (roomId, socketId, uuid, nickname, avatar) => {
  const room = getRoomById(roomId);

  if (!roomExists(room)) {
    throw new RoomError(SocketErrors.ROOM_NOT_FOUND, "ROOM_NOT_FOUND");
  }
  if (!isNicknameValid(nickname)) {
    throw new RoomError(SocketErrors.INVALID_NICKNAME, "INVALID_NICKNAME");
  }
  if (!isAvatarValid(avatar)) {
    throw new RoomError(SocketErrors.INVALID_AVATAR, "INVALID_AVATAR");
  }
  if (isUserKicked(room, uuid)) {
    throw new RoomError(SocketErrors.USER_KICKED, "USER_KICKED");
  }
  if (isRoomFull(room)) {
    throw new RoomError(SocketErrors.ROOM_FULL, "ROOM_FULL");
  }
  if (isGameInProgress(room)) {
    throw new RoomError(SocketErrors.GAME_IN_PROGRESS, "GAME_IN_PROGRESS");
  }
  if (isUserInRoom(room, socketId, uuid)) {
    throw new RoomError(SocketErrors.ALREADY_IN_ROOM, "ALREADY_IN_ROOM");
  }
  if (isNicknameInUse(room, nickname)) {
    throw new RoomError(SocketErrors.NICKNAME_IN_USE, "NICKNAME_IN_USE");
  }

  room.addUser(new User(socketId, uuid, nickname, avatar));

  return room;
};

const sendMessage = (roomId, socketId) => {
  const room = getRoomById(roomId);
  if (!roomExists(room)) {
    throw new RoomError(SocketErrors.ROOM_NOT_FOUND, "ROOM_NOT_FOUND");
  }
  if (!isUserInRoom(room, socketId)) {
    throw new RoomError(SocketErrors.NO_LONGER_IN_ROOM, "NO_LONGER_IN_ROOM");
  }
  const user = room.getUserBySocket(socketId);
  return user;
};

const transferOwnership = (roomId, socketId, userId) => {
  const room = getRoomById(roomId);
  if (!roomExists(room)) {
    throw new RoomError(SocketErrors.ROOM_NOT_FOUND, "ROOM_NOT_FOUND");
  }
  if (!isUserInRoom(room, socketId)) {
    throw new RoomError(SocketErrors.NO_LONGER_IN_ROOM, "NO_LONGER_IN_ROOM");
  }
  if (!isUserRoomOwner(room, socketId)) {
    throw new RoomError(SocketErrors.NOT_ROOM_OWNER, "NOT_ROOM_OWNER");
  }
  const user = room.getUserBySocket(userId);
  if (!user) {
    throw new RoomError(SocketErrors.USER_NOT_FOUND, "USER_NOT_FOUND");
  }
  room.setOwner(userId);
  return { room, newOwner: userId };
};

const kickUser = (roomId, socketId, userId) => {
  const room = getRoomById(roomId);
  if (!roomExists(room)) {
    throw new RoomError(
      SocketErrors.ROOM_NO_LONGER_EXISTS,
      "ROOM_NO_LONGER_EXISTS"
    );
  }
  //Check if person kicking is still in the room
  if (!isUserInRoom(room, socketId)) {
    throw new RoomError(SocketErrors.NO_LONGER_IN_ROOM, "NO_LONGER_IN_ROOM");
  }
  if (!isUserRoomOwner(room, socketId)) {
    throw new RoomError(SocketErrors.NOT_ROOM_OWNER, "NOT_ROOM_OWNER");
  }
  const user = room.getUserBySocket(userId);
  if (!user) {
    throw new RoomError(SocketErrors.USER_NOT_FOUND, "USER_NOT_FOUND");
  }
  const { game } = room;
  game.stopGame();
  room.kickUser(userId);
  return { room, user };
};

const leaveRoom = (roomId, socketId) => {
  const room = getRoomById(roomId);
  if (!roomExists(room)) {
    throw new RoomError(
      SocketErrors.ROOM_NO_LONGER_EXISTS,
      "ROOM_NO_LONGER_EXISTS"
    );
  }
  if (!isUserInRoom(room, socketId)) {
    throw new RoomError(SocketErrors.NO_LONGER_IN_ROOM, "NO_LONGER_IN_ROOM");
  }
  const user = room.getUserBySocket(socketId);
  const { game } = room;
  game.stopGame();
  room.removeUser(socketId);
  if (room.users.length === 0) {
    deleteRoom(roomId);
  }
  const newOwner = changeRoomOwner(room, socketId);

  return { user, newOwner, room };
};

const roomCheck = (roomId, socketId) => {
  const room = getRoomById(roomId);
  if (!roomExists(room)) {
    throw new RoomError(SocketErrors.ROOM_NOT_FOUND, "ROOM_NOT_FOUND");
  }
  if (!isUserInRoom(room, socketId)) {
    throw new RoomError(SocketErrors.NO_LONGER_IN_ROOM, "NO_LONGER_IN_ROOM");
  }
  return room;
};

const roomCheckOwner = (roomId, socketId) => {
  const room = getRoomById(roomId);
  if (!roomExists(room)) {
    throw new RoomError(SocketErrors.ROOM_NOT_FOUND, "ROOM_NOT_FOUND");
  }
  if (!isUserInRoom(room, socketId)) {
    throw new RoomError(SocketErrors.NO_LONGER_IN_ROOM, "NO_LONGER_IN_ROOM");
  }
  if (!isUserRoomOwner(room, socketId)) {
    throw new RoomError(SocketErrors.NOT_ROOM_OWNER, "NOT_ROOM_OWNER");
  }
  return room;
};

const leaveAllRooms = (socketId) => {
  const rooms = getRooms();
  const roomsUserIsIn = {};
  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (isUserInRoom(room, socketId)) {
      roomsUserIsIn[roomId] = room;
    }
  }
  return roomsUserIsIn;
};

module.exports = {
  createRoom,
  joinRoom,
  sendMessage,
  transferOwnership,
  kickUser,
  leaveRoom,
  roomCheck,
  roomCheckOwner,
  leaveAllRooms,
};
