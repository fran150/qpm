var esprima = require('esprima');
var escodegen = require('escodegen');
const fsPath = require('path');
const chalk = require('chalk');

module.exports = {
    addPackage: function(quarkData, bowerConfig, fileContent, spaces, debug) {
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

                                            if (quarkData.config.paths && quarkData.config.paths != null) {
                                                for (let newPath in quarkData.config.paths) {
                                                    let found = false;

                                                    paths.forEach(function(path) {
                                                        if (path.key.value == newPath) {
                                                            found = true;
                                                        }
                                                    });

                                                    if (!found) {
                                                        let path = quarkData.config.paths[newPath];

                                                        path = fsPath.relative(process.cwd(), bowerConfig.canonicalDir + "/../" + path);
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

                                            if (quarkData.config.shims && quarkData.config.shims != null) {
                                                for (let newShim in quarkData.config.shims) {
                                                    let found = false;

                                                    shims.forEach(function(shim) {
                                                        if (shim.key.value == newShim) {
                                                            found = true;
                                                        }
                                                    });

                                                    if (!found) {
                                                        let shim = quarkData.config.shims[newShim];

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
    }
}
