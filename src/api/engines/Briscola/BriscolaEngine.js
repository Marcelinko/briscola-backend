const BriscolaDeck = require("./BriscolaDeck");
const BriscolaPlayer = require("./BriscolaPlayer");
const { Values, Points } = require("./BriscolaCard");
const GameError = require("../../errors/GameError");

class BriscolaEngine {
  constructor() {
    this.players = [];
    this.deck = null;
    this.trumpCard = null;
    this.firstPlayerIndex = 0;
    this.currentPlayerIndex = -1;
    this.roundCards = [];
    this.teams = [];
    this.gameActive = false;
    this.turnTime = 15; //Turn time in seconds(never less than blockPlay timeout)
    this.timer = null; //Timer for turn
    this.blockPlay = false;
    this.blockTimeout = null; //Timeout for blockPlay
  }
  //TODO: Naredi da ti random najnizjo karto vrze pr 3 igralcih in emitas event
  //TODO: Blockplay je kul, pošlji socket error: Počakaj trenutek
  startGame(roomId, users, io) {
    if (users.length < 2) throw new GameError(SocketErrors.NOT_ENOUGH_PLAYERS);
    if (this.gameActive) throw new GameError(SocketErrors.GAME_IN_PROGRESS);
    this.initializeGame(users, true);
    this.dealStartingCards(roomId, io);
  }

  stopGame() {
    this.clearGame();
    this.clearTimeouts();
    clearInterval(this.timer);
  }

  playCard(roomId, card, playerId, io) {
    if (!this.gameActive)
      throw new GameError(SocketErrors.GAME_NOT_IN_PROGRESS);
    if (!this.isYourTurn(playerId))
      throw new GameError(SocketErrors.NOT_YOUR_TURN);
    if (this.blockPlay) throw new GameError(SocketErrors.BLOCK_PLAY);

    const player = this.players.find((player) => player.id === playerId);
    if (!player) {
      return;
    }
    this.playCardFromPlayer(player, card);
    clearInterval(this.timer);
    io.to(playerId).emit("briscola:hand", this.getPlayerHand(playerId));
    if (this.isRoundComplete()) {
      io.to(roomId).emit("briscola:update", this.gameState());
      this.handleRoundComplete(roomId, io);
    } else {
      this.nextPlayer();
      io.to(roomId).emit("briscola:update", this.gameState());
      io.to(this.getCurrentPlayer().id).emit("briscola:turn");
      this.startTurnTimer(roomId, io);
    }
  }

  handleRoundComplete(roomId, io) {
    const roundWinner = this.getRoundWinner();
    this.currentPlayerIndex = this.players.indexOf(roundWinner);
    roundWinner.cardsWon.push(...this.roundCards);
    //isLastDeal
    if (this.isLastDeal()) {
      const lastPlayer = this.players.find(
        (_, index) =>
          index ===
          (this.currentPlayerIndex + this.players.length - 1) %
            this.players.length
      );
      lastPlayer.hand.push(this.trumpCard);
      if (this.teams.length !== 0) {
        this.teams.forEach((team) => {
          team.forEach((player) => {
            io.to(roomId).emit("briscola:teamCards", this.getTeamCards(player));
          });
        });
      }
    }
    this.dealRound();
    this.roundCards = [];
    io.to(roomId).emit("briscola:roundWinner", roundWinner);
    this.blockPlay = true;
    this.blockTimeout = setTimeout(() => {
      this.players.forEach((player) => {
        io.to(player.id).emit("briscola:hand", player.hand);
      });
      //If game is complete do not deal
      io.to(roomId).emit(
        "briscola:dealRound",
        this.gameState(!this.isDeckEmpty())
      );
      if (this.isGameComplete()) {
        this.handleGameComplete(roomId, io);
      } else {
        this.startTurnTimer(roomId, io);
      }
      this.blockPlay = false;
    }, 3000);
  }

  handleGameComplete(roomId, io) {
    const gameWinnerAnimationTime = 2000;

    //const gameResult = this.getGameResult();
    io.to(roomId).emit("briscola:gameWinner", "Someone won idk");
    this.newGame(roomId, io);
  }

  playCardFromPlayer(player, card) {
    const { id, nickname } = player;
    const playedCard = {
      player: { id, nickname },
      card,
    };

    const cardIndex = player.hand.findIndex((handCard) => {
      return handCard.suit === card.suit && handCard.value === card.value;
    });
    if (cardIndex === -1) {
      return;
    }
    player.hand = player.hand.filter((handCard) => {
      return !(handCard.suit === card.suit && handCard.value === card.value);
    });
    this.roundCards.push(playedCard);
  }

  playRandomCard(roomId, io) {
    const currentPlayer = this.players[this.currentPlayerIndex];
    const randomCard =
      currentPlayer.hand[Math.floor(Math.random() * currentPlayer.hand.length)];
    this.playCard(roomId, randomCard, currentPlayer.id, io);
  }

  nextPlayer() {
    this.currentPlayerIndex =
      (this.currentPlayerIndex + 1) % this.players.length;
  }

  dealRound() {
    let currentIndex = this.currentPlayerIndex;
    for (let i = 0; i < this.players.length; i++) {
      const playerIndex = (currentIndex + i) % this.players.length;
      const player = this.players[playerIndex];
      const dealtCard = this.deck.deal(1)[0];
      if (dealtCard) {
        player.hand.push(dealtCard);
      }
    }
  }

  getRoundWinner() {
    let highestCard = this.roundCards[0];
    this.roundCards.forEach((playedCard) => {
      const isFirstPlayedSuit = playedCard.card.suit === highestCard.card.suit;
      const isTrumpSuit = playedCard.card.suit === this.trumpCard.suit;
      if (isTrumpSuit) {
        if (highestCard.card.suit === this.trumpCard.suit) {
          if (this.isHigherCard(playedCard.card, highestCard.card)) {
            highestCard = playedCard;
          }
        } else {
          highestCard = playedCard;
        }
      } else if (isFirstPlayedSuit) {
        if (this.isHigherCard(playedCard.card, highestCard.card)) {
          highestCard = playedCard;
        }
      }
    });
    return this.players.find((player) => player.id === highestCard.player.id);
  }

  getTeamCards(player) {
    const playerIndex = this.players.indexOf(player);
    const teammateIndex = (playerIndex + 2) % this.players.length;
    const teammate = this.players[teammateIndex];
    return [...teammate.hand];
  }

  getGameResult() {
    const points = {};
    this.players.forEach((player) => {
      player.cardsWon.forEach((card) => {
        const cardPoints =
          Points[card.card.value.toUpperCase()] || Points.default;
        points[player.id] = (points[player.id] || 0) + cardPoints;
      });
    });
    // for (const playerId in points) {
    //   if (points[playerId] > highestPoints) {
    //     highestPoints = points[playerId];
    //     winners = [{ playerId, points: points[playerId] }];
    //   } else if (points[playerId] === highestPoints) {
    //     winners.push({ playerId, points: points[playerId] });
    //   }
    // }
    return result;
  }

  newGame(roomId, io) {
    this.initializeGame([], false);
    this.dealStartingCards(roomId, io);
  }

  initializeGame(users, initial) {
    this.deck = new BriscolaDeck();
    this.deck.shuffle();
    //TODO: remove this
    //this.deck.removeCards(16);
    this.trumpCard = this.deck.deal(1)[0];
    if (initial) {
      this.players = users.map(
        (user) => new BriscolaPlayer(user.id, user.nickname)
      );
      if (this.players.length === 3) {
        this.deck.removeLowestCard();
      }
      if (this.players.length === 4) {
        this.formTeams();
      }
      this.gameActive = true;
      this.firstPlayerIndex = Math.floor(Math.random() * this.players.length);
      this.currentPlayerIndex = this.firstPlayerIndex;
    } else {
      this.players.forEach((player) => {
        player.reset();
      });
      this.firstPlayerIndex = (this.firstPlayerIndex + 1) % this.players.length;
      this.currentPlayerIndex = this.firstPlayerIndex;
    }
  }

  dealStartingCards(roomId, io) {
    for (let i = 0; i < this.players.length; i++) {
      const playerIndex = (this.firstPlayerIndex + i) % this.players.length;
      const player = this.players[playerIndex];
      const dealtCards = this.deck.deal(3);
      player.hand.push(...dealtCards);
    }
    io.to(roomId).emit("briscola:dealGame", this.gameState());
    const dealAnimationTime = this.players.length * 500 + 1000;
    this.players.forEach((player) => {
      io.to(player.id).emit("briscola:hand", player.hand);
    });
    this.startTurnTimer(roomId, io);
  }

  formTeams() {
    this.teams = [
      [this.players[0], this.players[2]],
      [this.players[1], this.players[3]],
    ];
  }

  clearGame() {
    this.players = [];
    this.deck = null;
    this.trumpCard = null;
    this.currentPlayerIndex = -1;
    this.roundCards = [];
    this.gameActive = false;
    this.teams = [];
    this.blockPlay = false;
  }

  clearTimeouts() {
    clearTimeout(this.blockTimeout);
  }

  isHigherCard(card1, card2) {
    const rank1 = Object.values(Values).indexOf(card1.value);
    const rank2 = Object.values(Values).indexOf(card2.value);
    return rank1 < rank2;
  }

  getPlayerHand(playerId) {
    return this.players.find((player) => player.id === playerId).hand;
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  isYourTurn(playerId) {
    if (this.currentPlayerIndex === -1) return false;
    return this.players[this.currentPlayerIndex].id === playerId;
  }

  isRoundComplete() {
    return this.roundCards.length === this.players.length;
  }

  //If deck is empty we don't show the trump card
  isDeckEmpty() {
    return this.deck.cards.length === 0;
  }

  //If it is the last deal we show our teammates cards
  isLastDeal() {
    return this.deck.cards.length === this.players.length - 1;
  }

  //If all players have no cards left, the game is finished
  isGameComplete() {
    return this.players.every((player) => player.hand.length === 0);
  }

  startTurnTimer = (roomId, io) => {
    let time = this.turnTime;
    this.timer = setInterval(() => {
      io.to(roomId).emit("briscola:turnTimer", time);
      time--;
      if (time < 0) {
        this.playRandomCard(roomId, io);
      }
    }, 1000);
  };

  gameState(inclueTrumpCard = true) {
    const gameState = {
      players: this.players.map((player) => player.toJSON()),
      currentPlayer: this.players[this.currentPlayerIndex].toJSON(),
      roundCards: this.roundCards,
      gameActive: this.gameActive,
    };
    if (inclueTrumpCard) {
      gameState.trumpCard = this.trumpCard;
    }
    return gameState;
  }
}

module.exports = {
  BriscolaEngine,
};
