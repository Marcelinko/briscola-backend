class User {
  constructor(id, uuid, nickname) {
    this.id = id;
    this.uuid = uuid;
    this.nickname = nickname;
  }
  toJSON() {
    return {
      id: this.id,
      nickname: this.nickname,
    };
  }
}

module.exports = User;
