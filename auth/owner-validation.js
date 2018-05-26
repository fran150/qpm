const octokit = require('@octokit/rest')();
var chalk = require('chalk');
var Login = require('./login');
var fs = require('fs');
var bower = require('./bower-node');
var Q = require('q');

function ValidateOwner(spaces, callback) {
    return Q.Promise(function(resolve, reject) {
        octokit.authorization.create({
            scopes: ['user', 'repo'],
            note: 'Qpm command line client (' + new Date().toISOString() + ')'
        }).then(function(data) {
            octokit.repos.getAll({
                'affiliation': 'owner'
            }).then(function(repos) {
                fs.readFile('bower.json', function(err, bowerContent) {
                    if (err) {
                        
                    } else {
                        var bowerConfig = JSON.parse(bowerContent);
    
                        bower.lookup(bowerConfig.name, "  ").then(function(bowerRepo) {
                            var found = false;
                            for (var i = 0; i < repos.data.length; i++) {
                                var repo = repos.data[i];
    
                                if (repo.clone_url == bowerRepo.url) {
                                    found = true;
                                    break;
                                }
                            }
                            
                            if (found) {
                                console.log(chalk.green("Can register"));
                            }
                        })
                    }
                })
            })
        })
    })
}

module.exports = commandRegister;

