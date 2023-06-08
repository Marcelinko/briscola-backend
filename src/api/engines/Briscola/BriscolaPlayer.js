class BriscolaPlayer {
  constructor(id, nickname) {
    this.id = id;
    this.nickname = nickname;
    this.hand = [];
    this.cardsWon = [];
    this.wins = 0;
  }
  toJSON() {
    return {
      id: this.id,
      nickname: this.nickname,
    };
  }
}

module.exports = BriscolaPlayer;
