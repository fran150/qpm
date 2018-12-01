require = requireConfigure(QuarkRequireConf('bower_modules', true));
require = requireConfigure(require, {
    paths: {
        'app/config': 'app/config',
        'app/services': 'services',
        'qk-alchemy': '../mock/bower_modules/qk-alchemy/src',
        'bootstrap/css': '../mock/bower_modules/bootstrap/bootstrap/dist/css/bootstrap.min',
        'bootstrap/js': '../mock/bower_modules/bootstrap/bootstrap/dist/js/bootstrap.min'
    },
    shim: {}
});