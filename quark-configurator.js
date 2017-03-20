var esprima = require('esprima');
var escodegen = require('escodegen');
const fsPath = require('path');
const chalk = require('chalk');

module.exports = {
    addPackage: function(quarkData, bowerConfig, fileContent, spaces, debug) {
        if (!spaces) spaces = "";

        var parsed = esprima.parse(fileContent);

        parsed.body.forEach(function(statement) {
            if (statement.type == "ExpressionStatement") {
                if (statement.expression.type == "AssignmentExpression") {
                    var assignment = statement.expression;

                    if (assignment.operator == "=" && assignment.left.type == "Identifier" && assignment.left.name == "require") {
                        if (assignment.right.type == "CallExpression" && assignment.right.callee.type == "Identifier" && assignment.right.callee.name == "requireConfigure") {
                            var arguments = assignment.right.arguments;

                            if (arguments.length == 2) {
                                if (arguments[1].type == "ObjectExpression") {
                                    var properties = arguments[1].properties;

                                    properties.forEach(function(property) {
                                        if (property.key.type == "Identifier" && property.key.name == "paths") {
                                            var paths = property.value.properties;

                                            if (quarkData.config.paths && quarkData.config.paths != null) {
                                                for (var newPath in quarkData.config.paths) {
                                                    var found = false;

                                                    paths.forEach(function(path) {
                                                        if (path.key.value == newPath) {
                                                            found = true;
                                                        }
                                                    });

                                                    if (!found) {
                                                        var path = quarkData.config.paths[newPath];

                                                        if (path) {
                                                            path = fsPath.relative(process.cwd(), bowerConfig.canonicalDir + "/" + path);
                                                            path = path.replace(/\\/g, "/");
                                                        }

                                                        var code = "var temp = { '" + newPath + "': '" + path + "' }";
                                                        var temp = esprima.parse(code);
                                                        var newProp = temp.body[0].declarations[0].init.properties[0];

                                                        paths.push(newProp);

                                                        console.log(spaces + chalk.blue("Added new path: %s"), newPath);
                                                    }
                                                }
                                            }
                                        }

                                        if (property.key.type == "Identifier" && property.key.name == "shim") {
                                            var shims = property.value.properties;

                                            console.log(quarkData.config.shims);

                                            if (quarkData.config.shims && quarkData.config.shims != null) {
                                                for (var newShim in quarkData.config.shims) {
                                                    var found = false;

                                                    shims.forEach(function(shim) {
                                                        if (shim.key.value == newShim) {
                                                            found = true;
                                                        }
                                                    });

                                                    if (!found) {
                                                        var shim = quarkData.config.shims[newShim];

                                                        var code = "var temp = { '" + newShim + "': { deps: [";
                                                        var first = true;

                                                        shim.forEach(function(value) {
                                                            if (!first) {
                                                                code += ", ";
                                                            } else {
                                                                first = false;
                                                            }

                                                            code += "'" + value + "'";
                                                        });

                                                        code += "] } }";

                                                        var temp = esprima.parse(code);
                                                        var newProp = temp.body[0].declarations[0].init.properties[0];
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

        var generated = escodegen.generate(parsed);
        return generated;
    }
}
