require = requireConfigure(QuarkRequireConf('bower_modules', true));
require = requireConfigure(require, {
    paths: {
        'app/config': 'app/config',
        'app/services': 'services'
    },
    shim: {}
});