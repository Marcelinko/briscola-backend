const { Card, Suits, Values, Points, Power } = require('./BriscolaCard');

class Deck {
    constructor() {
        this.cards = [];
        this.create();
    }

    create = () => {
        for (let suit in Suits) {
            for (let value in Values) {
                const points = Points[value] || Points.default;
                this.cards.push(new Card(Suits[suit], Values[value], points, Power[value]));
            }
        }
    }

    shuffle = () => {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    deal = (amount) => {
        return this.cards.splice(0, amount);
    }

}

module.exports = Deck;