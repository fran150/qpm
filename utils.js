

function Utils() {
    var self = this;
    
    // Check if the specified var is an array
    this.isArray = function (variable) {
        return $.isArray(variable);
    };

    // Check if the specified var is an object
    this.isObject = function (variable) {
        if (variable !== null && typeof variable === 'object' && !(variable instanceof Array)) {
            return true;
        }

        return false;
    };
    
}

module.exports = new Utils();