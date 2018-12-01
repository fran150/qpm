var BaseExceptions = require("./base.exceptions");

function BaseDirNotFoundException() {
    BaseExceptions.BusinessException.call(this);
    this.type = 'BaseDirNotFoundException';
    this.message = "Quark config file not found. If not using standard location use -c or --config argument to specify the path";
}

BaseDirNotFoundException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
BaseDirNotFoundException.prototype.constructor = BaseDirNotFoundException;

function CantCheckBaseDirExistenceException(path, ex) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'CantCheckBaseDirExistenceException';
    this.message = "Can't find a base dir for the application. By default qpm uses ./src if your base dir is custom use -b or --base parameters to specify it";
    this.path = path;
    this.innerException = ex;
}

CantCheckBaseDirExistenceException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
CantCheckBaseDirExistenceException.prototype.constructor = CantCheckBaseDirExistenceException;


module.exports = {
    "BaseDirNotFoundException": BaseDirNotFoundException,
    "CantCheckBaseDirExistenceException": CantCheckBaseDirExistenceException
}