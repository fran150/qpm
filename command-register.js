const octokit = require('@octokit/rest')();
var chalk = require('chalk');
var Login = require('./login');
var fs = require('fs');
var bower = require('./bower-node');

function commandRegister(spaces, callback) {
    Login(spaces + "  ").then(function(data) {
    });
}

module.exports = commandRegister;

