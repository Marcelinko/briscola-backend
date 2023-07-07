const Messsage = require("../models/Room/Message");
const SystemMessage = require("../models/Room/SystemMessage");
const roomUtils = require("../utils/roomUtils");

const isCallbackFunction = (cb) => {
  return typeof cb === "function";
};

module.exports = (io, socket) => {
  const createRoom = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { uuid = "modified", nickname } = data;

    try {
      const { roomId, room } = roomUtils.createRoom(socket.id, uuid, nickname);
      socket.join(roomId);
      cb(null, room.toJSON());
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const joinRoom = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, uuid = "modified", nickname } = data;

    try {
      const room = roomUtils.joinRoom(roomId, socket.id, uuid, nickname);
      socket.join(roomId);
      io.to(roomId).emit("room:update", room);
      socket.broadcast
        .to(roomId)
        .emit(
          "room:newMessage",
          new SystemMessage(`${nickname} has joined the room`, "join")
        );
      cb(null, room.toJSON());
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const sendMessage = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, message } = data;
    if (!message) return;
    try {
      const user = roomUtils.sendMessage(roomId, socket.id);
      io.to(roomId).emit(
        "room:newMessage",
        new Messsage(user.toJSON(), message)
      );
      cb(null);
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const kickUser = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, userId } = data;
    try {
      const { room, user } = roomUtils.kickUser(roomId, socket.id, userId);
      const socketToKick = io.sockets.sockets.get(userId);
      if (socketToKick) {
        socketToKick.leave(roomId);
      }
      socket
        .to(userId)
        .emit(
          "room:kicked",
          new SystemMessage(`You were kicked from the room`)
        );
      io.to(roomId).emit(
        "room:newMessage",
        new SystemMessage(`${user.nickname} was kicked from the room`, "kick")
      );
      io.to(roomId).emit("room:update", room.toJSON());
      io.to(roomId).emit("briscola:stopGame");
      cb(null);
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const shuffleUsers = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId } = data;
    try {
      const room = roomUtils.roomCheckOwner(roomId, socket.id);
      if (room.users.length < 4) {
        throw new Error("Not enough players to shuffle teams");
      }
      if (room.game.playing) {
        throw new Error("Can't shuffle teams while playing");
      }
      room.shuffleUsers();
      io.to(roomId).emit("room:update", room.toJSON());
      cb(null);
    } catch (err) {
      cb({ error: err.message });
    }
  };

  const leaveRoom = (data) => {
    const { roomId } = data;
    try {
      const { user, newOwner, room } = roomUtils.leaveRoom(roomId, socket.id);
      io.to(roomId).emit(
        "room:newMessage",
        new SystemMessage(`${user.nickname} has left the room`, "leave")
      );
      socket.leave(roomId);
      io.to(newOwner).emit(
        "room:newOwner",
        new SystemMessage("You are the new owner of the room")
      );
      io.to(roomId).emit("room:update", room.toJSON());
      io.to(roomId).emit("briscola:stopGame");
    } catch (err) {
      console.log(err);
    }
  };

  const onDisconnect = () => {
    const rooms = roomUtils.leaveAllRooms(socket.id);
    for (const roomId in rooms) {
      leaveRoom({ roomId });
    }
  };

  socket.on("room:create", createRoom);
  socket.on("room:join", joinRoom);
  socket.on("room:sendMessage", sendMessage);
  socket.on("room:kickUser", kickUser);
  socket.on("room:shuffleUsers", shuffleUsers);
  socket.on("room:leave", leaveRoom);
  socket.on("disconnect", onDisconnect);
};
