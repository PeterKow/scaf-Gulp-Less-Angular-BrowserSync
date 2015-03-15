module.exports = function() {
    var client = './public/';
    var clientApp = client + 'app/';
    var report = './report';
    var temp = './tmp/';
    var server = './src/server/';

    var build = './build/';
    var bowerComponents = './bower_components/';
    var wiredep = require('wiredep');
    // get dev dependencies and reqular dep only js files
    var bowerFiles = wiredep({
        devDependencies: true
    })['js'];

    var config = {

        ///////////////////////////////////////////////////////////////////
        //  Main
        ///////////////////////////////////////////////////////////////////

        client: client,
        temp: temp,
        server: server,
        build: build,
        index: client + 'index.html',
        html: clientApp + '**/*.html',

        ///////////////////////////////////////////////////////////////////
        //  File paths
        ///////////////////////////////////////////////////////////////////

        alljs: [
            client + '**/*.js', './*.js'
        ],

        js: [
            clientApp + '**/*.module.js',
            clientApp + '**/*.js',
            '!' + clientApp + '**/*.spec.js'
        ],

        ///////////////////////////////////////////////////////////////////
        //  CSS and LESS
        ///////////////////////////////////////////////////////////////////

        css: temp + '**/*.css',
        less: clientApp + '**/*.less',

        ///////////////////////////////////////////////////////////////////
        //  HTML Templates
        ///////////////////////////////////////////////////////////////////

        htmlTemplates: clientApp + '**/*.html',
        templateCache: {
            file: 'template.js',
            options: {
                module: 'app',
                standAllone: false,
                root: 'app/'
            }
        },
        ///////////////////////////////////////////////////////////////////
        //  Fonts
        ///////////////////////////////////////////////////////////////////

        fonts: bowerComponents + 'font-awesome/fonts/**/*.*',

        ///////////////////////////////////////////////////////////////////
        //  Images
        ///////////////////////////////////////////////////////////////////

        images: client + 'images/**/*.*',


        ///////////////////////////////////////////////////////////////////
        //  Karma
        ///////////////////////////////////////////////////////////////////

        report: report,
        serverIntegrationSpec: [client + 'test/server-integration/**/*.spec.js'],
        specHelpers: [client + 'test-helpers/*.js'],

        ///////////////////////////////////////////////////////////////////
        //  Bower
        ///////////////////////////////////////////////////////////////////

        bower: {
            json: require('./bower.json'),
            directory: './bower_components/',
            ignorePath: '../',
        },

        ///////////////////////////////////////////////////////////////////
        //  Node settings
        ///////////////////////////////////////////////////////////////////

        defaultPort: 5000,
        nodeServer: server + 'server.js',

        ///////////////////////////////////////////////////////////////////
        //  Browser sync
        ///////////////////////////////////////////////////////////////////

        browserReloadDelay: 1000,

    };

    config.getWiredepDefaultOptions = function() {
        var options = {
            bowerJson: config.bower.json,
            directory: config.bower.directory,
            ignorePath: config.bower.ignorePath
        };

        return options;
    };

    config.karma = getKarmaOptions();

    return config;


    function getKarmaOptions() {
        var options = {
            files: [].concat(
                bowerFiles,
                // mock data etc. files
                config.specHelpers,
                // app files
                clientApp + '**/*.module.js',
                clientApp + '**/*.js',
                // html templates
                temp + config.templateCache.file,
                // integration tests
                config.serverIntegrationSpec
            ),
            exclusions: [],
            coverage: {
                dir: report + 'coverage',
                reporters: [{
                    type: 'html',
                    subdir: 'report-html'
                }, {
                    type: 'lcov',
                    subdir: 'report-html'
                }, {
                    type: 'text-summary'
                }]
            },
            preprocessors: {}
        };
        // don't test test files
        options.preprocessors[clientApp + '**/!(*.spec.js)+(.js)'] = ['coverage'];

        return options;
    }
};