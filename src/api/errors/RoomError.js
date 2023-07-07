class RoomError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "RoomError";
  }
}

module.exports = RoomError;
