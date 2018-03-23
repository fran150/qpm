

function Utils() {
    var self = this;
    
    // Process the result of bower command to a simpler object
    this.processBowerListResult = function(data, result) {
        result[data.pkgMeta.name] = {
            name: data.pkgMeta.name,
            dir: data.canonicalDir,
            version: data.pkgMeta.version
        };
    
        if (data.dependencies) {
            for (var index in data.dependencies) {
                result = self.processBowerListResult(data.dependencies[index], result);
            }            
        }
    
        return result;
    }

    this.processBowerInstallResult = function(data, result) {
        result = {};
        
        for (var name in data) {
            result[name] = {
                name: name,
                dir: data[name].canonicalDir,
                version: data[name].pkgMeta.version
            };
        }

        return result;
    }

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