const Messsage = require("../models/Room/Message");
const SystemMessage = require("../models/Room/SystemMessage");
const User = require("../models/Room/User");
const SocketErrors = require("../models/SocketErrors");
const {
  createNewRoom,
  getRoomById,
  deleteRoom,
  getRooms,
} = require("../utils/roomUtils");

const isCallbackFunction = (cb) => {
  return typeof cb === "function";
};
//TODO: MAX_PLAYERS, MIN_PLAYERS, USERNAME LENGTH
module.exports = (io, socket) => {
  const createRoom = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { gameId, nickname } = data;
    if (!gameId) return;
    if (!nickname) return;
    const room = createNewRoom(gameId, socket.id);
    room.addUser(new User(socket.id, nickname));
    socket.join(room.id);
    cb(null, room);
  };

  const joinRoom = (data, cb) => {
    //TODO: add uuid and check if room has user with that uuid
    if (!isCallbackFunction(cb)) return;
    const { roomId, nickname } = data;
    const room = getRoomById(roomId);
    if (!room) return cb({ error: SocketErrors.ROOM_NOT_FOUND });
    if (room.hasUser(socket.id))
      return cb({ error: SocketErrors.ALREADY_IN_ROOM });
    if (!nickname) return;
    room.addUser(new User(socket.id, nickname));
    socket.join(roomId);
    io.to(roomId).emit("room:update", room);
    socket.broadcast
      .to(roomId)
      .emit(
        "room:newMessage",
        new SystemMessage(`${nickname} has joined the room`, "join")
      );
    cb(null, room);
  };

  const sendMessage = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, message } = data;
    const room = getRoomById(roomId);
    if (!room) return cb({ error: SocketErrors.ROOM_NO_LONGER_EXISTS });
    if (!room.hasUser(socket.id)) return;
    if (!message) return;
    io.to(roomId).emit(
      "room:newMessage",
      new Messsage(room.getUser(socket.id), message)
    );
    cb(null);
  };

  const kickUser = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, userId } = data;
    const room = getRoomById(roomId);
    if (!room) return cb({ error: SocketErrors.ROOM_NO_LONGER_EXISTS });
    if (!room.hasUser(socket.id)) return;
    if (room.owner !== socket.id) return;
    if (room.owner === userId) return;
    const user = room.getUser(userId);
    if (!user) return;
    socket
      .to(userId)
      .emit("room:kicked", new SystemMessage(`You were kicked from the room`));
    room.removeUser(userId);
    io.to(roomId).emit(
      "room:newMessage",
      new SystemMessage(`${user.nickname} was kicked from the room`, "kick")
    );
    io.to(roomId).emit("room:update", room);
    cb(null);
  };

  const leaveRoom = (data) => {
    const { roomId } = data;
    const room = getRoomById(roomId);
    if (!room) return;
    if (!room.hasUser(socket.id)) return;
    io.to(roomId).emit(
      "room:newMessage",
      new SystemMessage(
        `${room.getUser(socket.id).nickname} has left the room`,
        "leave"
      )
    );
    socket.leave(roomId);
    room.removeUser(socket.id);
    room.users.length === 0
      ? deleteRoom(roomId)
      : io.to(roomId).emit("room:update", room);
  };

  const leaveAllRooms = () => {
    console.log(`User ${socket.id} disconnected`);
    const rooms = getRooms();
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (room.hasUser(socket.id)) {
        io.to(roomId).emit(
          "room:newMessage",
          new SystemMessage(
            `${room.getUser(socket.id).nickname} has left the room`,
            "leave"
          )
        );
        room.removeUser(socket.id);
        socket.leave(roomId);
        room.users.length === 0
          ? deleteRoom(roomId)
          : io.to(roomId).emit("room:update", room);
      }
    }
  };

  const changeGame = (data) => {
    const { roomId, game } = data;
    const room = getRoomById(roomId);
    if (!room) return;
    if (!room.hasUser(socket.id)) return;
    if (room.owner !== socket.id) return;
    room.game = game;
    io.to(roomId).emit("room:update", room);
  };

  socket.on("room:create", createRoom);
  socket.on("room:join", joinRoom);
  socket.on("room:sendMessage", sendMessage);
  socket.on("room:kickUser", kickUser);
  socket.on("room:leave", leaveRoom);
  socket.on("room:changeGame", changeGame);
  socket.on("disconnect", leaveAllRooms);
};
