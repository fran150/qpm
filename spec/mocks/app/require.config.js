require = requireConfigure(QuarkRequireConf('bower_modules', true));
require = requireConfigure(require, {
    paths: {
        'app/config': 'app/config',
        'app/services': 'services',
        'qk-alchemy': 'bower_modules/qk-alchemy/src',
        'bootstrap/css': 'bower_modules/bootstrap/bootstrap/dist/css/bootstrap.min',
        'bootstrap/js': 'bower_modules/bootstrap/bootstrap/dist/js/bootstrap.min'
    },
    shim: {}
});