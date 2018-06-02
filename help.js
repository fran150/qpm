var chalk = require('chalk');

// Shows help
module.exports = {
    show: function showHelp(command) {
        var help = "";

        switch (command) {
            case "bundle":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " bundle <package>";
                help += "\n\nOptions: ";
                help += chalk.yellow("\n\n  -g --gulpfile") + "\t Gulp configuration file path. Defaults to ./gulp.conf.json";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nApplies bundling config as suggested in package\'s quark.json to the gulp configuration file.");
                help += chalk.bold.white("This allows the package to be bundled as recommended by it´s authors.");            
                break;

            case "install":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " install (with no args on project dir)";
                help += "\n      - Installs all packages configured in bower.json on current project.\n"
                help += "\n  " + chalk.cyan("qpm") + " install <package>";
                help += "\n      - Installs the specified package on current project\n";
                help += "\n  " + chalk.cyan("qpm") + " install <package>#<version>"
                help += "\n      - Installs the specified package version on current project\n";
                help += "\n\nOptions:";
                help += "\n\n  " + chalk.yellow("-b,  --base") + "\t Base dir from where the bower modules are referenced on quark's config.";
                help += "\n  " + chalk.yellow("-c,  --config") + "\t Quark configuration file.";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nInstall the specified bower package marking it as a dependency and configures quark\'s require file.");
                break;

            case "link":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " link <package>";
                help += "\n      - Symlinks the specified package on current project\n";
                help += "\n\nOptions:";
                help += "\n\n  " + chalk.yellow("-b,  --base") + "\t Base dir from where the bower modules are referenced on quark's config.";
                help += "\n  " + chalk.yellow("-c,  --config") + "\t Quark configuration file.";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nCreates a symbolic link to the specified bower package and configures quark\'s require file.");
                help += chalk.bold.white("Previously the target package must have a global link created with bower link (see bower\'s documentation).");
                help += chalk.bold.white("It is used to test a package because changes are reflected inmediatly.");
                break;

            case "rebundle":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " rebundle";
                help += "\n\nOptions: ";
                help += chalk.yellow("\n\n  -g --gulpfile") + "\t Gulp configuration file path. Defaults to ./gulp.conf.json";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nApplies bundling config as suggested in package\'s quark.json to the gulp configuration file for all the installed packages.");
                break;
                
            case "register":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " register";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nRegister the quark config for the package on the qpm registry.");
                help += chalk.bold.white("\nThis command registers a new or updates the current configuration for the package with the given name.")
                help += chalk.bold.white("\nAnyone can register a package in quark but only the original author or a github repo collaborator for that package can update it");
                break;
                
            case "unbundle":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " unbundle <package>";
                help += "\n\nOptions: ";
                help += chalk.yellow("\n\n  -g --gulpfile") + "\t Gulp configuration file path. Defaults to ./gulp.conf.json";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nRemoves bundling config of the specified package from the gulp configuration file.");
                break;

            case "uninstall":
                help += "\nUsage: \n";
                help += "\n  " + chalk.cyan("qpm") + " uninstall <package>";
                help += "\n\nOptions:";
                help += "\n\n  " + chalk.yellow("-b,  --base") + "\t Base dir from where the bower modules are referenced on quark's config.";
                help += "\n  " + chalk.yellow("-c,  --config") + "\t Quark configuration file.";
                help += "\n\nDescription:";
                help += chalk.bold.white("\n\nUninstall the specified bower package and remove configuration from quark\'s require file");
                break;
                break;
                
            default:
                help += chalk.cyan("qpm") +" is the quark's package manager!";
                help += "\n\nUsage: " + chalk.cyan("qpm") + chalk.bold.white(" <command>");
                help += "\n\nwhere " + chalk.bold.white("<command>") + " is one of:\n";
                help += chalk.green("\n  bundle") + "\t Config bundling for an installed package";
                help += chalk.green("\n  help") + "\t\t Display help information about qpm";
                help += chalk.green("\n  install") + "\t Install a package locally and config the require file";
                help += chalk.green("\n  link") + "\t\t Symlink a package and config the require file";
                help += chalk.green("\n  rebundle") + "\t Config bundling for all installed packages";
                help += chalk.green("\n  register") + "\t Register a package configuration";
                help += chalk.green("\n  unbundle") + "\t Delete bundling configuration of a package";
                help += chalk.green("\n  uninstall") + "\t Remove a local package";
                help += "\n\nOptions:";
                help += chalk.yellow("\n  -d --debug") + "\t Ouput debug information";
                help += chalk.yellow("\n  -v --verbose") + "\t Makes debug output more verbose";
                help += "\n\nUse \'qpm help " + chalk.bold.white("<command>") + "\' for more information on specific command";
                
                
        }

        console.log(help);
    }
}
