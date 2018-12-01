var BaseExceptions = require("./base.exceptions");

function GulpFileNotFoundException() {
    BaseExceptions.BusinessException.call(this);
    this.type = 'GulpFileNotFoundException';
    this.message = "Gulp config file not found. If not using standard location use -g or --gulpfile argument to specify the path";
}

GulpFileNotFoundException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
GulpFileNotFoundException.prototype.constructor = GulpFileNotFoundException;

function CantCheckGulpFileExistenceException(path, ex) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'CantCheckGulpFileExistenceException';
    this.message = "Error trying to found if gulp config file exists. Verify that the specified file exists and that you have access.";
    this.path = path;
    this.innerException = ex;
}

CantCheckGulpFileExistenceException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
CantCheckGulpFileExistenceException.prototype.constructor = CantCheckGulpFileExistenceException;


module.exports = {
    "GulpFileNotFoundException": GulpFileNotFoundException,
    "CantCheckGulpFileExistenceException": CantCheckGulpFileExistenceException
}