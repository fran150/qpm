const octokit = require('@octokit/rest')();
var inquirer = require('inquirer');
var chalk = require('chalk');
var args = require('./arguments');

function Login(spaces) {
    return Q.Promise(function(resolve, reject) {
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
    
            if (args.isDebug()) {
                console.log(spaces + chalk.yellow("Creando autorización GitHub..."));
            }    
    
            octokit.authorization.create({
                scopes: ['user', 'repo'],
                note: 'Qpm command line client (' + new Date().toISOString() + ')'
            }).then(function(data) {
    
                if (args.isDebug()) {
                    console.log(spaces + chalk.yellow("Autorización GitHub obtenida correctamente..."));
    
                    if (args.isVerbose()) {
                        console.log(chalk.white(data));
                    }
                }

                resolve(data);
            }).catch(function(err) {
                var error = JSON.parse(err);
                if (error.message == 'Bad credentials') {
                    console.log(chalk.red("Error authenticating user."));
                } else {
                    console.log(err);
                }
            });

            reject(err);
        });    
    }) 
}

module.exports = Login;

