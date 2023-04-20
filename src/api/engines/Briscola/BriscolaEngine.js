const BriscolaDeck = require("./BriscolaDeck");
const { Values, Card } = require("./BriscolaCard");
class BriscolaEngine {
  constructor() {
    this.players = [];
    this.deck = new BriscolaDeck();
    this.trumpCard = null;
    this.firstPlayerGameIndex = 0;
    this.firstPlayerRoundIndex = 0;
    this.currentPlayerIndex = 0;
    this.roundCards = [];
  }

  startGame(players) {
    this.players = players;
    this.deck.shuffle();
    this.playingCard = this.deck.deal(1)[0];
    this.dealCards();
  }

  nextPlayer() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  getPlayerState(playerId) {
    const player = this.players.find((player) => player.id === playerId);
    return {
      hand: player.hand,
      points: player.points,
    };
  }

  getGameState() {
    const currentPlayer = this.players[this.currentPlayerIndex];
    return {
      playingCard: this.playingCard,
      currentPlayer: {
        id: currentPlayer.id,
        name: currentPlayer.name,
      },
      roundCards: this.roundCards,
      cardsLeft: this.deck.cards.length + 1,
    };
  }

  //TODO: implement different dealing strategies
  dealCards() {
    this.players.forEach((player) => {
      player.hand = this.deck.deal(3);
    });
  }

  isValidCard(playerId, card) {
    const player = this.players.find((player) => player.id === playerId);
    return player.hand.some((handCard) => {
      return (
        handCard.suit === card.suit &&
        handCard.value === card.value &&
        handCard.points === card.points &&
        handCard.power === card.power
      );
    });
  }

  isLastPlayerOfRound() {
    if (this.roundCards.length === this.players.length) {
      this.endRound();
      return true;
    }
  }

  isLastRound() {
    if (this.deck.cards.length + 1 === this.players.length) {
      return true;
    }
  }

  playCard(playerId, card) {
    const player = this.players.find((player) => player.id === playerId);
    const cardIndex = player.hand.findIndex((handCard) => {
      return (
        handCard.suit === card.suit &&
        handCard.value === card.value &&
        handCard.points === card.points &&
        handCard.power === card.power
      );
    });
    player.hand.splice(cardIndex, 1);
    const cardPlayed = {
      player: {
        id: player.id,
        name: player.name,
      },
      card,
    };
    this.roundCards.push(cardPlayed);
    this.nextPlayer();
  }

  endRound() {
    let highestCard = this.roundCards[0];
    console.log("--Round--");
    console.log(this.roundCards);
    this.roundCards.forEach((cardPlayed) => {
      console.log(Values[cardPlayed.card.value]);
      if (
        !highestCard ||
        Values[cardPlayed.card.value] > Values[highestCard.card.value]
      ) {
        highestCard = cardPlayed;
      }
    });
    const winner = this.players.find(
      (player) => player.id === highestCard.player.id
    );
    winner.cardsWon.push(
      ...this.roundCards.map(
        (cardPlayed) =>
          new Card(
            cardPlayed.card.suit,
            cardPlayed.card.value,
            cardPlayed.card.points
          )
      )
    );
    this.nextRound();
  }

  nextRound() {
    this.roundCards = [];
    if (this.isLastRound()) {
      for (let i = 0; i < this.players.length; i++) {
        if (i === this.players.length - 1) {
          this.players[i].cardsWon.push(this.playingCard);
        } else {
          this.players[i].hand.push(this.deck.deal(1)[0]);
        }
      }
    } else {
      this.players.forEach((player) => {
        player.hand.push(this.deck.deal(1)[0]);
      });
    }
  }

  endGame() {
    //TODO: Calculate points and determine winner
    this.players.forEach((player) => {
      player.hand = [];
    });
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
