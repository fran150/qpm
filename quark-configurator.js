var esprima = require('esprima');
var escodegen = require('escodegen');
const fsPath = require('path');
const chalk = require('chalk');

module.exports = {
    checkConfig: function (fileContent, spaces, debug) {
        let parsed = esprima.parse(fileContent);

        if (debug) {
            console.log(chalk.yellow(spaces + "Checking config file validity..."));
            console.log(chalk.yellow(spaces + "Checking config file for requireConfigure..."));
        }
        
        for (var bodyIndex in parsed.body) {
            var statement = parsed.body[bodyIndex];

            if (statement.type == "ExpressionStatement") {
                if (statement.expression.type == "AssignmentExpression") {
                    let assignment = statement.expression;

                    if (assignment.operator == "=" && assignment.left.type == "Identifier" && assignment.left.name == "require") {
                        if (assignment.right.type == "CallExpression" && assignment.right.callee.type == "Identifier" && assignment.right.callee.name == "requireConfigure") {
                            let arguments = assignment.right.arguments;

                            if (arguments.length == 2) {
                                if (arguments[1].type == "ObjectExpression") {
                                    let properties = arguments[1].properties;

                                    var pathFound = false;
                                    var shimFound = false;

                                    for (var propIndex in properties) {
                                        var property = properties[propIndex];

                                        if (property.key.type == "Identifier" && property.key.name == "paths") {
                                            pathFound = true;

                                            if (debug) {
                                                console.log(chalk.yellow(spaces + "Path config found..."));
                                            }                                            
                                        }

                                        if (property.key.type == "Identifier" && property.key.name == "shim") {                                        
                                            shimFound = true;

                                            if (debug) {
                                                console.log(chalk.yellow(spaces + "Shim config found..."));
                                            }                                                                                        
                                        }
                                    };

                                    if (pathFound && shimFound) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        return false;
    },

    addPackage: function (quarkData, bowerConfig, fileContent, spaces, debug, baseDir) {
        if (!spaces) spaces = "";

        let parsed = esprima.parse(fileContent);

        parsed.body.forEach(function(statement) {
            if (statement.type == "ExpressionStatement") {
                if (statement.expression.type == "AssignmentExpression") {
                    let assignment = statement.expression;

                    if (assignment.operator == "=" && assignment.left.type == "Identifier" && assignment.left.name == "require") {
                        if (assignment.right.type == "CallExpression" && assignment.right.callee.type == "Identifier" && assignment.right.callee.name == "requireConfigure") {
                            let arguments = assignment.right.arguments;

                            if (arguments.length == 2) {
                                if (arguments[1].type == "ObjectExpression") {
                                    let properties = arguments[1].properties;

                                    properties.forEach(function(property) {
                                        if (property.key.type == "Identifier" && property.key.name == "paths") {
                                            let paths = property.value.properties;

                                            if (quarkData.paths && quarkData.paths != null) {
                                                for (let newPath in quarkData.paths) {
                                                    let found = false;

                                                    paths.forEach(function(path) {
                                                        if (path.key.value == newPath) {
                                                            found = true;
                                                        }
                                                    });

                                                    if (!found) {
                                                        let path = quarkData.paths[newPath];
                                                        var base; 
                                                        
                                                        if (baseDir) {
                                                            base = fsPath.resolve(process.cwd(), baseDir);
                                                        } else {
                                                            base = process.cwd();
                                                        }

                                                        path = fsPath.relative(base, bowerConfig.dir + "/" + path);
                                                        path = path.replace(/\\/g, "/");

                                                        let code = "var temp = { '" + newPath + "': '" + path + "' }";
                                                        let temp = esprima.parse(code);
                                                        let newProp = temp.body[0].declarations[0].init.properties[0];

                                                        paths.push(newProp);

                                                        console.log(spaces + chalk.blue("Added new path: %s"), newPath);
                                                    }
                                                }
                                            }
                                        }

                                        if (property.key.type == "Identifier" && property.key.name == "shim") {
                                            let shims = property.value.properties;

                                            if (quarkData.shims && quarkData.shims != null) {
                                                for (let newShim in quarkData.shims) {
                                                    let found = false;

                                                    shims.forEach(function(shim) {
                                                        if (shim.key.value == newShim) {
                                                            found = true;
                                                        }
                                                    });

                                                    if (!found) {
                                                        let shim = quarkData.shims[newShim];

                                                        let code = "var temp = { '" + newShim + "': { deps: [";
                                                        let first = true;

                                                        shim.forEach(function(value) {
                                                            if (!first) {
                                                                code += ", ";
                                                            } else {
                                                                first = false;
                                                            }

                                                            code += "'" + value + "'";
                                                        });

                                                        code += "] } }";

                                                        let temp = esprima.parse(code);
                                                        let newProp = temp.body[0].declarations[0].init.properties[0];
                                                        shims.push(newProp);

                                                        console.log(spaces + chalk.blue("Added new shim: %s"), newShim);
                                                    }
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        });

        let generated = escodegen.generate(parsed);
        return generated;
    },

    removePackage: function (quarkData, bowerConfig, fileContent, spaces, debug) {
        if (!spaces) spaces = "";

        let parsed = esprima.parse(fileContent);

        parsed.body.forEach(function (statement) {
            if (statement.type == "ExpressionStatement") {
                if (statement.expression.type == "AssignmentExpression") {
                    let assignment = statement.expression;

                    if (assignment.operator == "=" && assignment.left.type == "Identifier" && assignment.left.name == "require") {
                        if (assignment.right.type == "CallExpression" && assignment.right.callee.type == "Identifier" && assignment.right.callee.name == "requireConfigure") {
                            let arguments = assignment.right.arguments;

                            if (arguments.length == 2) {
                                if (arguments[1].type == "ObjectExpression") {
                                    let properties = arguments[1].properties;

                                    properties.forEach(function (property) {
                                        if (property.key.type == "Identifier" && property.key.name == "paths") {
                                            let paths = property.value.properties;

                                            if (quarkData.paths && quarkData.paths != null) {
                                                for (let newPath in quarkData.paths) {
                                                    paths.forEach(function (path) {
                                                        if (path.key.value == newPath) {
                                                            var index = paths.indexOf(path);
                                                            if (index > -1) {                                                                
                                                                paths.splice(index, 1);
                                                                console.log(spaces + chalk.blue("Removed path: %s"), newPath);
                                                            }                                                            
                                                        }
                                                    });                                                        
                                                }
                                            }
                                        }

                                        if (property.key.type == "Identifier" && property.key.name == "shim") {
                                            let shims = property.value.properties;

                                            if (quarkData.shims && quarkData.shims != null) {
                                                for (let newShim in quarkData.shims) {
                                                    shims.forEach(function (shim) {
                                                        if (shim.key.value == newShim) {
                                                            var index = shims.indexOf(shim);
                                                            if (index > -1) {
                                                                shims.splice(index, 1);
                                                                console.log(spaces + chalk.blue("Removed shim: %s"), newShim);
                                                            }                                                            
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                }
            }
        });

        let generated = escodegen.generate(parsed);
        return generated;
    }
    
}
