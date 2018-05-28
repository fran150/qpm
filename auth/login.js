var Q = require('q');
const octokit = require('@octokit/rest')();
var inquirer = require('inquirer');
var chalk = require('chalk');

var logger = require('../utils/logger');

function login(spaces) {
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
    
            logger.debug("Requesting Github an access token with the specified user and password");

            octokit.authorization.create({
                scopes: ['user', 'repo'],
                note: 'QPM command line client (' + new Date().toISOString() + ')'
            }).then(function(data) {
                logger.debug("Access token obtained");
                logger.verbose(JSON.stringify(data, null, 4));

                resolve(data.data);
            }).catch(function(err) {
                var error = JSON.parse(err);

                if (error.message == 'Bad credentials') {
                    logger.error("Error authenticating user.");
                } else {
                    logger.error(err);
                }
            });
        });    
    }) 
}

module.exports = login;

