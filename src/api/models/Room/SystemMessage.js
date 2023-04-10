const Messsage = require("./Message");

class SystemMessage extends Messsage {
  constructor(message, type) {
    super("system", message);
    this.type = type;
  }
}

module.exports = SystemMessage;
