const { BriscolaEngine } = require("../../engines/Briscola/BriscolaEngine");

class Room {
  constructor(id, owner) {
    this.id = id;
    this.owner = owner;
    this.users = [];
    this.kickedUsers = [];
    this.game = new BriscolaEngine();
  }

  getOwner() {
    return this.owner;
  }

  setOwner(socketId) {
    this.owner = socketId;
  }

  getUserByUUID(uuid) {
    return this.users.find((user) => user.uuid === uuid);
  }

  getUserBySocket(socketId) {
    return this.users.find((user) => user.id === socketId);
  }

  addUser(user) {
    this.users.push(user);
  }

  removeUser(socketId) {
    this.users = this.users.filter((user) => user.id !== socketId);
  }

  isUserKicked(uuid) {
    return this.kickedUsers.some((user) => user.uuid === uuid);
  }

  kickUser(socketId) {
    this.kickedUsers.push(this.users.find((user) => user.id === socketId));
    this.removeUser(socketId);
  }

  startGame() {
    this.game.startGame(this.users);
  }

  shuffleUsers() {
    for (let i = this.users.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = this.users[i];
      this.users[i] = this.users[j];
      this.users[j] = temp;
    }
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
