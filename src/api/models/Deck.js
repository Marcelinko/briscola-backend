const { Card, Groups, Values, Points } = require('./Card');

class Deck {
    constructor() {
        this.cards = [];
        this.create();
    }

    create = () => {
        for (let group in Groups) {
            for (let value in Values) {
                const points = Points[value] || Points.default;
                this.cards.push(new Card(Groups[group], Values[value], points));
            }
        }
    }

    shuffle = () => {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

}

module.exports = Deck;