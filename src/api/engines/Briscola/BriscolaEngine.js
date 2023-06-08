const BriscolaDeck = require("./BriscolaDeck");
const BriscolaPlayer = require("./BriscolaPlayer");
const { Values, Points } = require("./BriscolaCard");
class BriscolaEngine {
  constructor() {
    this.players = [];
    this.deck = null;
    this.trumpCard = null;

    this.currentPlayerIndex = 0;
    this.roundCards = [];
    this.playedCards = 0;
    this.status = Status.WAITING;
  }

  playCard(playerId, card) {
    const player = this.players.find((player) => player.id === playerId);
    const cardIndex = player.hand.findIndex((handCard) => {
      return handCard.suit === card.suit && handCard.value === card.value;
    });
    if (cardIndex === -1) return;
    player.hand.splice(cardIndex, 1);
    const cardPlayed = {
      player: {
        id: player.id,
        nickname: player.nickname,
      },
      card,
    };
    this.playedCards++;
    this.roundCards.push(cardPlayed);
    if (this.isLastPlayerOfRound()) {
      this.currentPlayerIndex;
      setTimeout(() => {
        this.endRound();
      }, 2000);
    } else {
      this.nextPlayer();
    }
  }

  determineGameWinner() {
    const points = {};
    this.players.forEach((player) => {
      const cards = player.cardsWon;
      cards.forEach((card) => {
        const cardValue =
          Points[card.card.value.toUpperCase()] || Points.default;
        points[player.id] = (points[player.id] || 0) + cardValue;
      });
    });

    let maxPoints = -Infinity;
    let winners = [];
    for (const playerId in points) {
      if (points[playerId] > maxPoints) {
        maxPoints = points[playerId];
        winners = [playerId];
      } else if (points[playerId] === maxPoints) {
        winners.push(playerId);
      }
    }
    if (winners.length === 1) {
      const winner = this.players.find((player) => player.id === winners[0]);
      return `The winner is ${winner.nickname} with ${maxPoints} points`;
    } else {
      const drawPlayers = winners.map((winner) => {
        return this.players.find((player) => player.id === winner);
      });
      const drawPlayerNames = drawPlayers
        .map((player) => player.nickname)
        .join(", ");
      return `The game ended in a draw between ${drawPlayerNames} with ${maxPoints} points`;
    }
  }

  newGame(users) {
    this.reset();
    users.forEach((user) => {
      this.players.push(new BriscolaPlayer(user.id, user.nickname));
    });
    this.deck = new BriscolaDeck();
    if (this.players.length === 3) {
      this.deck.removeLowestCard();
    }
    this.deck.shuffle();
    this.trumpCard = this.deck.deal(1)[0];
    this.dealCards();
    this.status = Status.PLAYING;
  }

  reset() {
    this.players = [];
    this.deck = null;
    this.trumpCard = null;
    this.currentPlayerIndex = 0;
    this.playedCards = 0;
    this.roundCards = [];
    this.status = Status.WAITING;
  }

  isYourTurn(playerId) {
    if (this.players.length === 0) return false;
    return this.players[this.currentPlayerIndex].id === playerId;
  }

  getTurn() {
    return this.players[this.currentPlayerIndex].id;
  }

  isLastPlayerOfRound() {
    if (this.roundCards.length === this.players.length) {
      return true;
    }
  }

  isLastDeal() {
    return this.deck.cards.length === this.players.length - 1;
  }

  dealCards() {
    this.players.forEach((player) => {
      player.hand = this.deck.deal(3);
    });
  }

  isGameOver() {
    if (this.players.length === 3) {
      return this.playedCards === 39;
    }
    return this.playedCards === 40;
  }

  nextPlayer() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  getPlayerHand(playerId) {
    return this.players.find((player) => player.id === playerId).hand;
  }

  determineRoundWinner() {
    let winner = this.roundCards[0];
    for (let i = 1; i < this.roundCards.length; i++) {
      const card = this.roundCards[i].card;
      const isFirstPlayedSuit = card.suit === winner.card.suit;
      const isTrumpSuit = card.suit === this.trumpCard.suit;
      if (isTrumpSuit) {
        if (winner.card.suit === this.trumpCard.suit) {
          if (this.isHigherCard(card, winner.card)) {
            winner = this.roundCards[i];
          }
        } else {
          winner = this.roundCards[i];
        }
      } else if (isFirstPlayedSuit) {
        if (this.isHigherCard(card, winner.card)) {
          winner = this.roundCards[i];
        }
      }
    }
    return winner;
  }

  isHigherCard(card1, card2) {
    const rank1 = Object.values(Values).indexOf(card1.value);
    const rank2 = Object.values(Values).indexOf(card2.value);
    return rank1 < rank2;
  }

  endRound() {
    const winner = this.determineRoundWinner();
    this.currentPlayerIndex = this.players.findIndex(
      (player) => player.id === winner.player.id
    );
    this.players[this.currentPlayerIndex].cardsWon.push(...this.roundCards);
    if (this.isLastDeal()) {
      const lastPlayerIndex =
        (this.currentPlayerIndex + this.players.length - 1) %
        this.players.length;
      const lastPlayer = this.players[lastPlayerIndex];
      lastPlayer.hand.push(this.trumpCard);
    }
    for (let i = 0; i < this.players.length; i++) {
      const playerIndex = (this.currentPlayerIndex + i) % this.players.length;
      const player = this.players[playerIndex];
      player.hand.push(...this.deck.deal(1));
    }
    this.roundCards = [];
  }

  getRound() {
    return {
      roundCards: this.roundCards,
    };
  }

  toJSON() {
    return {
      players: this.players,
      trumpCard: this.trumpCard,
      turn: this.players[this.currentPlayerIndex],
      cardsLeft: this.deck.cards.length + 1,
    };
  }
}

const Status = {
  WAITING: "waiting",
  PLAYING: "playing",
  FINISHED: "finished",
};

module.exports = {
  BriscolaEngine,
  Status,
};
