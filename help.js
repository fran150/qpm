// Shows help
module.exports = {
    show: function showHelp(command) {
        var help = "";

        switch (command) {
            case "install":
                help += "\n  qpm install (with no args on project dir)";
                help += "\n      - Installs all dependencies on current project.\n"
                help += "\n  qpm install <dependency>";
                help += "\n      - Installs the specified dependency on current project\n";
                help += "\n  qpm install <dependency>@<version>"
                help += "\n      - Installs the specified dependency version on current project\n";
            default:
                help += "\nUsage: qpm <command> \n\n";
                help += "where <commad> is one of:\n"
                help += "   install";
                help += "\n\nqpm <cmd> -h     quick help on <cmd>\n";
        }

        console.log(help);
    }
}
