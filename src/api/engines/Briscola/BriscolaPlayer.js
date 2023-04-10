class Player {
    constructor(id, name) {
        this.id = id;
        this.name = name;
        this.hand = [];
        this.cardsWon = [];
        this.wins = 0;
    }
    fromJSON(json) {
        const { id, name, hand, cardsWon } = JSON.parse(json);
        return new Player(id, name, hand, cardsWon);
    }
}

module.exports = Player;