var fs = require('fs');
var merge = require('merge');

function getDefaultConfig() {
    return {
        packages: {
            host: "srvdepadesa2008",
            port: 15080,
            path: "/Quark/v1.0/Package/"
        },
        http: {
        }
    }
}

module.exports = {
    read: function(callback) {
        var rcFile = {};

        var target = "./.qpmrc";

        if (fs.existsSync(target)) {
            fs.readFile(target, 'utf8', function(err, fileContent) {
                if (err) {
                    console.log(chalk.red("Error Reading File:"));
                    console.log(chalk.red("%j"), err);
                }

                rcFile = JSON.parse(fileContent);

                console.log(rcFile);

                var config = merge.recursive(getDefaultConfig(), rcFile);

                callback(config);
            });
        } else {
            callback(getDefaultConfig());
        }
    }
}
