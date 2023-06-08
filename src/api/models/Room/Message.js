class Messsage {
  constructor(sender, message) {
    this.sender = sender;
    this.message = message;
    this.timestamp = Date.now();
  }
}

module.exports = Messsage;
