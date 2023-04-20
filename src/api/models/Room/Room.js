const engines = require("../../engines/engines");
class Room {
  constructor(id, owner, game, engine) {
    this.id = id;
    this.owner = owner;
    this.users = [];
    this.game = game;
    this.engine = engine;
    this.kickedUsers = [];
  }
  hasUserUUID(uuid) {
    return this.users.some((user) => user.uuid === uuid);
  }

  hasUserSocket(socketId) {
    return this.users.some((user) => user.id === socketId);
  }
  addUser(user) {
    this.users.push(user);
  }
  getUser(socketId) {
    return this.users.find((user) => user.id === socketId);
  }
  kickUser(socketId) {
    this.kickedUsers.push(socketId);
    this.removeUser(socketId);
  }
  isUserKicked(socketId) {
    return this.kickedUsers.includes(socketId);
  }
  removeUser(socketId) {
    this.users = this.users.filter((user) => user.id !== socketId);
  }
  setGame(game) {
    this.game = game;
    this.engine = engines[game.id];
  }
  toJSON() {
    return {
      id: this.id,
      owner: this.owner,
      users: this.users,
      game: this.game,
    };
  }
}

module.exports = Room;
