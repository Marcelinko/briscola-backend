class User {
  constructor(id, uuid, nickname, avatar = 1) {
    this.id = id;
    this.uuid = uuid;
    this.nickname = nickname;
    this.avatar = avatar;
  }
  toJSON() {
    return {
      id: this.id,
      nickname: this.nickname,
      avatar: this.avatar,
    };
  }
}

module.exports = User;
