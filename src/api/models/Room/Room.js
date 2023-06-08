const { BriscolaEngine } = require("../../engines/Briscola/BriscolaEngine");

class Room {
  constructor(id, owner) {
    this.id = id;
    this.owner = owner;
    this.users = [];
    this.kickedUsers = [];
    this.game = new BriscolaEngine();
  }

  setOwner(socketId) {
    this.owner = socketId;
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
    this.kickedUsers.push(this.users.find((user) => user.id === socketId));
    this.removeUser(socketId);
  }
  isUserKicked(uuid) {
    return this.kickedUsers.some((user) => user.uuid === uuid);
  }
  removeUser(socketId) {
    this.users = this.users.filter((user) => user.id !== socketId);
  }
  startGame() {
    this.game.newGame(this.users);
  }
  toJSON() {
    return {
      id: this.id,
      owner: this.owner,
      users: this.users.map((user) => user.toJSON()),
    };
  }
}

module.exports = Room;
