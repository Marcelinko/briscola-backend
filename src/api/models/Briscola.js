class Briscola {
    constructor() {
        this.players = [];
    }

    dealCards = (deck) => {
        const cardsPerPlayer = 3;
        const playersCount = this.players.length;


        getPlayerCount = () => {
            return this.players.length;
        }

        kickPlayer = (id) => {
            this.players = this.players.filter(player => player.id !== id);
        }

        getPlayer = (id) => {
            return this.players.find(player => player.id === id);
        }

        addPlayer = (player) => {
            this.players.push(player);
        }
    }
}