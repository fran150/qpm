var fs = require('fs');
var merge = require('merge');

function getDefaultConfig() {
    return {
        server: "http://localhost:3000"
    }
}

module.exports = {
    read: function() {
        var rcFile = {};

        var target = "./.qpmrc";

        if (fs.existsSync(target)) {
            var fileContent = fs.readFileSync(target, 'utf8');

            rcFile = JSON.parse(fileContent);

            var config = merge.recursive(getDefaultConfig(), rcFile);

            return config;
        } else {
            return getDefaultConfig();
        }
    }
}
