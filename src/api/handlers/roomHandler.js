const Messsage = require("../models/Room/Message");
const SystemMessage = require("../models/Room/SystemMessage");
const User = require("../models/Room/User");
const roomUtils = require("../utils/roomUtils");
const SocketErrors = require("../models/SocketErrors");

const isCallbackFunction = (cb) => {
  return typeof cb === "function";
};

module.exports = (io, socket) => {
  const createRoom = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { uuid = "modified", nickname } = data;

    if (!roomUtils.isNicknameValid(nickname)) return;
    const room = roomUtils.createNewRoom(socket.id, uuid, nickname);
    room.addUser(new User(socket.id, uuid, nickname));
    socket.join(room.id);
    cb(null, room.toJSON());
  };

  const joinRoom = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, uuid = "modified", nickname } = data;
    const room = roomUtils.getRoomById(roomId);

    if (!roomUtils.roomExists(room))
      return cb({ error: SocketErrors.ROOM_NOT_FOUND });
    if (!roomUtils.isNicknameValid(nickname)) return;
    if (roomUtils.isUserInRoom(room, socket.id, uuid))
      return cb({ error: SocketErrors.ALREADY_IN_ROOM });
    if (roomUtils.isUserKicked(room, uuid))
      return cb({ error: SocketErrors.USER_KICKED });
    if (roomUtils.isRoomFull(room))
      return cb({ error: SocketErrors.ROOM_FULL });
    if (roomUtils.isGameInProgress(room))
      return cb({ error: SocketErrors.GAME_IN_PROGRESS });
    room.addUser(new User(socket.id, uuid, nickname));
    socket.join(roomId);
    io.to(roomId).emit("room:update", room);
    socket.broadcast
      .to(roomId)
      .emit(
        "room:newMessage",
        new SystemMessage(`${nickname} has joined the room`, "join")
      );
    cb(null, room.toJSON());
  };

  const sendMessage = (data, cb) => {
    if (!isCallbackFunction(cb)) return;
    const { roomId, message } = data;
    const room = roomUtils.getRoomById(roomId);

    if (!roomUtils.roomExists(room))
      return cb({ error: SocketErrors.ROOM_NO_LONGER_EXISTS });
    if (!roomUtils.isUserInRoom(room, socket.id))
      return cb({ error: SocketErrors.NO_LONGER_IN_ROOM });
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
    const room = roomUtils.getRoomById(roomId);

    if (!roomUtils.roomExists(room))
      return cb({ error: SocketErrors.ROOM_NO_LONGER_EXISTS });
    if (!roomUtils.isUserInRoom(room, socket.id))
      return cb({ error: SocketErrors.USER_NOT_FOUND });
    if (!roomUtils.isUserOwner(room, socket.id) || room.owner === userId)
      return;
    const user = room.getUser(userId);
    const socketToKick = io.sockets.sockets.get(userId);
    if (socketToKick) {
      socketToKick.leave(roomId);
    }
    socket
      .to(userId)
      .emit("room:kicked", new SystemMessage(`You were kicked from the room`));
    roomUtils.kickUser(room, userId);
    io.to(roomId).emit(
      "room:newMessage",
      new SystemMessage(`${user.nickname} was kicked from the room`, "kick")
    );
    io.to(roomId).emit("room:update", room);
    cb(null);
  };

  const leaveRoom = (data) => {
    const { roomId } = data;
    const room = roomUtils.getRoomById(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
    if (!roomUtils.roomExists(room)) return;
    if (!roomUtils.isUserInRoom(room, socket.id)) return;
    io.to(roomId).emit(
      "room:newMessage",
      new SystemMessage(
        `${room.getUser(socket.id).nickname} has left the room`,
        "leave"
      )
    );
    socket.leave(roomId);
    roomUtils.leaveRoom(room, socket.id);
    const newOwner = roomUtils.changeOwner(room, socket.id);
    io.to(newOwner).emit(
      "room:newOwner",
      new SystemMessage("You are the new owner of the room")
    );
    if (room.game.status === "playing") {
      io.to(roomId).emit(
        "room:newMessage",
        new SystemMessage(`Game ended because someone left the room`, "leave")
      );
    }
    room.users.length === 0
      ? roomUtils.deleteRoom(roomId)
      : io.to(roomId).emit("room:update", room);
  };

  const onDisconnect = () => {
    console.log(`User ${socket.id} disconnected`);
    const rooms = roomUtils.getRooms();
    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (roomUtils.isUserInRoom(room, socket.id)) {
        leaveRoom({ roomId: room.id });
      }
    }
  };

  socket.on("room:create", createRoom);
  socket.on("room:join", joinRoom);
  socket.on("room:sendMessage", sendMessage);
  socket.on("room:kickUser", kickUser);
  socket.on("room:leave", leaveRoom);
  socket.on("disconnect", onDisconnect);
};
