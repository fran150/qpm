var BaseExceptions = require("./base.exceptions");

function CantReadQpmRcFileException(ex) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'CantReadQpmRcFileException';
    this.message = "There is an error reading the .qpmrc file";
    this.innerException = ex;
}

CantReadQpmRcFileException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
CantReadQpmRcFileException.prototype.constructor = CantReadQpmRcFileException;

module.exports = {
    "CantReadQpmRcFileException": CantReadQpmRcFileException
}