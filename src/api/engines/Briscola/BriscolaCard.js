class Card {
  constructor(suit, value, points) {
    this.suit = suit;
    this.value = value;
    this.points = points;
  }
}

const Suits = {
  SPADA: "Spada",
  KOPA: "Kopa",
  BASTON: "Baston",
  DINAR: "Dinar",
};

const Values = {
  AS: "As",
  TROJKA: "Trojka",
  KRALJ: "Kralj",
  KAVAL: "Kaval",
  FANT: "Fant",
  SEDEMKA: "Sedemka",
  SESTKA: "Sestka",
  PETKA: "Petka",
  STIRKA: "Stirka",
  DVOJKA: "Dvojka",
};

const Points = {
  AS: 11,
  TROJKA: 10,
  KRALJ: 4,
  KAVAL: 3,
  FANT: 2,
  default: 0,
};

module.exports = {
  Card,
  Suits,
  Values,
  Points,
};
