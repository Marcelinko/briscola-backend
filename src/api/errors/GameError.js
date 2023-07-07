class GameError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "GameError";
  }
}

module.exports = GameError;
