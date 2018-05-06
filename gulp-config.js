var readGulpConfigPromise = Q.Promise(function(resolve, reject) {
    if (debug) {
        console.log(chalk.yellow("Reading gulp config file:"));
        console.log(chalk.yellow("%s"), gulpJsonFile);
    }
                
    fs.exists(gulpJsonFile, function(exists) {
        if (exists) {
            fs.readFile(gulpJsonFile, 'utf8', function(err, data) {
                if (!err) {
                    var gulpJson = JSON.parse(data);                            

                    resolve(gulpJson);
                } else {
                    reject(err);
                }
            });
        } else {
            resolve();
        }    
    });
});

var configureGulpPromise = Q.all([ readGulpConfigPromise, bundlePromises]).then(function(results) {
    var gulpJson = results[0];

    return Q.all(results[1]).then(function(bundleConfigs) {
        for (var i = 0; i < bundleConfigs.length; i++) {
            var bundleConfig = bundleConfigs[i];

            if (bundleConfig) {
                gulpJson = merge(gulpJson, bundleConfig);    
            }
        }

        return gulpJson;
    });
});

var bundlePromises = packageConfigPromises.then(function(data) {
    var mods = data[0];
    var promises = new Array();

    console.log(chalk.green(spaces + "Searching for bundling info on installed packages..."));            
    
    // For each installed bower package
    for (let name in mods) {
        let bowerConfig = mods[name];

        // Return a promise for each config data
        promises.push(Q.Promise(function(resolve, reject) {                    
            fs.exists(bowerConfig.dir + "/bundling.json", function(exists) {                        
                if (exists) {                                    
                    fs.readFile(bowerConfig.dir + '/bundling.json', 'utf8', function(err, fileContent) {                                
                        if (!err) {
                            console.log(chalk.white(spaces + "Found bundle config for %s..."), name);

                            if (debug) {
                                console.log(chalk.yellow("Received bundle info:"));
                                console.log(chalk.yellow("%s"), JSON.stringify(fileContent, null, 4));
                            }

                            var bundleConfig = JSON.parse(fileContent);
                            resolve(bundleConfig);
                        } else {
                            reject(new Error(err));
                        }                                    
                    });
                } else {
                    resolve();
                }
            });
        }));                
    }

    return promises;
});
