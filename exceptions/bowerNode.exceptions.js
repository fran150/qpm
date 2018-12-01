var BaseExceptions = require("./base.exceptions");

function BowerNodeCommandException(ex, command) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'BowerNodeCommandException';
    this.message = "There was an error executing the bower command: " + command;
    this.innerException = ex;
    this.command = command;
}

BowerNodeCommandException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
BowerNodeCommandException.prototype.constructor = BowerNodeCommandException;

module.exports = {
    "BowerNodeCommandException": BowerNodeCommandException
}