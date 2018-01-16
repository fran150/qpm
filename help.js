var chalk = require('chalk');

// Shows help
module.exports = {
    show: function showHelp(command) {
        var help = "";

        switch (command) {
            case "install":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " install (with no args on project dir)";
                help += "\n      - Installs all dependencies on current project.\n"
                help += "\n  " + chalk.cyan("qpm") + " install <dependency>";
                help += "\n      - Installs the specified dependency on current project\n";
                help += "\n  " + chalk.cyan("qpm") + " install <dependency>#<version>"
                help += "\n      - Installs the specified dependency version on current project\n";
                help += "\n\nOptions: \n";
                help += "\n  " + chalk.yellow("-b,  --base") + "\t Allows to specify the base dir from where the bower modules are referenced on quark's config.";
                help += "\n  " + chalk.yellow("-c,  --config") + "\t Allows to specify the quark configuration file.";
                help += "\n  " + chalk.yellow("-h,  --help") + "\t Shows this help message";
                break;
            default:
                help += "\nUsage: qpm <command> \n\n";
                help += "where <commad> is one of:\n"
                help += "   install";
                help += "\n\nqpm <cmd> -h     quick help on <cmd>\n";
        }

        console.log(help);
    }
}
