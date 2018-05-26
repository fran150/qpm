var esprima = require('esprima');
var escodegen = require('escodegen');
const fsPath = require('path');

var logger = require('../utils/logger');

module.exports = {
    checkConfig: function (fileContent, spaces) {
        let parsed = esprima.parse(fileContent);

        logger.debug("Checking config file validity...", spaces);
        logger.debug("Checking config file for requireConfigure...", spaces);
        
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

                                            logger.debug("Path config found...", spaces);                                                                                        
                                        }

                                        if (property.key.type == "Identifier" && property.key.name == "shim") {                                        
                                            shimFound = true;

                                            logger.debug("Shim config found...", spaces);
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

    addPackage: function (quarkData, bowerConfig, fileContent, spaces, baseDir) {
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

                                                        logger.config("Added new path: " + newPath, spaces);
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

                                                        logger.config("Added new shim: " + newShim, spaces);
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

    removePackage: function (quarkData, bowerConfig, fileContent, spaces) {
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
                                                                logger.config("Removed path: " + newPath, spaces);
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
                                                                logger.config("Removed shim: " + newShim, spaces);
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
