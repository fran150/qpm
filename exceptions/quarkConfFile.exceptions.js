var BaseExceptions = require("./base.exceptions");

function QuarkConfFileNotFoundException() {
    BaseExceptions.BusinessException.call(this);
    this.type = 'QuarkConfFileNotFoundException';
    this.message = "Quark config file not found. If not using standard location use -c or --config argument to specify the path";
}

QuarkConfFileNotFoundException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
QuarkConfFileNotFoundException.prototype.constructor = QuarkConfFileNotFoundException;

function CantCheckQuarkConfigFileExistenceException(path, ex) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'CantCheckQuarkConfigFileExistenceException';
    this.message = "Error trying to found if quark config file exists. Verify that the specified file exists and that you have access.";
    this.path = path;
    this.innerException = ex;
}

CantCheckQuarkConfigFileExistenceException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
CantCheckQuarkConfigFileExistenceException.prototype.constructor = CantCheckQuarkConfigFileExistenceException;

function ErrorReadingQuarkConfFileException(path, ex) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'ErrorReadingQuarkConfFileException';
    this.message = "Can't read quark's configuration file (" + path + ")";
    this.path = path;
    this.innerException = ex;
}

ErrorReadingQuarkConfFileException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
ErrorReadingQuarkConfFileException.prototype.constructor = ErrorReadingQuarkConfFileException;

function InvalidQuarkConfFileException() {
    BaseExceptions.BusinessException.call(this);
    this.type = 'InvalidQuarkConfFileException';
    this.message = "The config file does not contain a valid requireConfigure call with path and shim.";
}

InvalidQuarkConfFileException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
InvalidQuarkConfFileException.prototype.constructor = InvalidQuarkConfFileException;



module.exports = {
    "QuarkConfFileNotFoundException": QuarkConfFileNotFoundException,
    "CantCheckQuarkConfigFileExistenceException": CantCheckQuarkConfigFileExistenceException,
    "ErrorReadingQuarkConfFileException": ErrorReadingQuarkConfFileException,
    "InvalidQuarkConfFileException": InvalidQuarkConfFileException
}