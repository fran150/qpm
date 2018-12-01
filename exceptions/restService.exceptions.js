var BaseExceptions = require("./base.exceptions");

function ErrorCallingServerException(ex) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'ErrorCallingServerException';
    this.message = "An error ocurred when trying to contact the server (" + ex.message + ")" ;
    this.innerException = ex;
}

ErrorCallingServerException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
ErrorCallingServerException.prototype.constructor = ErrorCallingServerException;

function ServerRespondedWithErrorException(response, body) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'ServerRespondedWithErrorException';
    this.message = "The server responded with an error (" + response.statusCode + ")";
    this.statusCode = response.statusCode;
    this.body = body;
}

ServerRespondedWithErrorException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
ServerRespondedWithErrorException.prototype.constructor = ServerRespondedWithErrorException;

function UnauthorizedException(response, body) {
    BaseExceptions.BusinessException.call(this);
    this.type = 'UnauthorizedException';
    this.message = "Unauthorized operation. If you were trying to register a package and the package exists the only users authorized to edit it are the original user that register the package first or a repo collaborator";
    this.statusCode = response.statusCode;
    this.body = body;
}

UnauthorizedException.prototype = Object.create(BaseExceptions.BusinessException.prototype);
UnauthorizedException.prototype.constructor = UnauthorizedException;


module.exports = {
    "ErrorCallingServerException": ErrorCallingServerException,
    "ServerRespondedWithErrorException": ServerRespondedWithErrorException,
    "UnauthorizedException": UnauthorizedException    
}