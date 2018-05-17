const octokit = require('@octokit/rest')();
var inquirer = require('inquirer');
var chalk = require('chalk');
var fs = require('fs');
var bower = require('./bower-node');

function commandRegister(spaces, callback) {
    var questions = [
        {
            name: 'username',
            message: 'Username',
            type: 'input'
        },
        {
            name: 'password',
            message: 'Password',
            type: 'password'
        }        
    ];

    inquirer.prompt(questions).then(function(answers) {
        octokit.authenticate({
            type: 'basic',
            username: answers.username,
            password: answers.password
        });    

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
        }).catch(function(err) {
            var error = JSON.parse(err);
            if (error.message == 'Bad credentials') {
                console.log(chalk.red("Error authenticating user."));
            } else {
                console.log(err);
            }
        })
    });
}

module.exports = commandRegister;

