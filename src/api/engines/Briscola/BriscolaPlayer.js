class BriscolaPlayer {
  constructor(socketId, nickname) {
    this.id = socketId;
    this.nickname = nickname;
    this.hand = [];
    this.cardsWon = [];
    this.wins = 0;
  }

  reset() {
    this.cardsWon = [];
  }

  toJSON() {
    return {
      id: this.id,
      nickname: this.nickname,
      cardsLeft: this.hand.length,
      wins: this.wins,
    };
  }
}

module.exports = BriscolaPlayer;
