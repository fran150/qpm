var chalk = require('chalk');
var argv = require('minimist')(process.argv.slice(2));

module.exports = {
    debug: function(text, spaces) {
        spaces = spaces || "";

        if (argv["d"] || argv["debug"]) {
            console.log(chalk.bold.white("[") + chalk.bold.yellow(" DEBUG ") + chalk.bold.white("] " + spaces + text));
        }        
    },
    verbose: function(text, spaces) {
        spaces = spaces || "";

        if ((argv["d"] || argv["debug"]) && (argv["v"] || argv["verbose"])) {
            console.log(chalk.bold.white("[") + chalk.bold.yellow(" VERBOSE ") + chalk.bold.white("] " + spaces + text));
        }
    },
    error: function(text, spaces) {
        spaces = spaces || "";

        console.log(chalk.bold.white("[") + chalk.bold.red(" ERROR ") + chalk.bold.white("] " + spaces + text));        
    },
    bower: function(text, spaces) {
        spaces = spaces || "";

        console.log(chalk.bold.white("[") + chalk.bold.cyan(" BOWER ") + chalk.bold.white("] " + spaces + text));        
    },
    config: function(text, spaces) {
        spaces = spaces || "";
        
        console.log(chalk.bold.white("[") + chalk.bold.blue(" CONFIG ") + chalk.bold.white("] " + spaces + text));        
    },
    info: function(text, spaces) {
        spaces = spaces || "";
        
        console.log(chalk.bold.white("[") + chalk.bold.green(" INFO ") + chalk.bold.white("] " + spaces + text));
    }    
}