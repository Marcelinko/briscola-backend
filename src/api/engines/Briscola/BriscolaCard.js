class Card {
    constructor(suit, value, points, power) {
        this.suit = suit;
        this.value = value;
        this.points = points;
        this.power = power;
    }
}

const Suits = {
    SPADA: 'Spada',
    KOPA: 'Kopa',
    BASTON: 'Baston',
    DINAR: 'Dinar'
};

const Values = {
    AS: 'As',
    TROJKA: 'Trojka',
    KRALJ: 'Kralj',
    KAVAL: 'Kaval',
    FANT: 'Fant',
    SEDEMKA: 'Sedemka',
    SESTKA: 'Sestka',
    PETKA: 'Petka',
    STIRKA: 'Stirka',
    DVOJKA: 'Dvojka'
};

const Points = {
    AS: 11,
    TROJKA: 10,
    KRALJ: 4,
    KAVAL: 3,
    FANT: 2,
    default: 0
};

const Power = {
    AS: 10,
    TROJKA: 9,
    KRALJ: 8,
    KAVAL: 7,
    FANT: 6,
    SEDEMKA: 5,
    SESTKA: 4,
    PETKA: 3,
    STIRKA: 2,
    DVOJKA: 1
};

module.exports = {
    Card,
    Suits,
    Values,
    Points,
    Power,
};