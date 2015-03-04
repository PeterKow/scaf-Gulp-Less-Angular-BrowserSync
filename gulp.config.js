module.exports = function() {
    var client = './public/';
    var clientApp = client + 'app/';
    var temp = './tmp/';
    var server = './src/server/';

    var build = './build/';
    var bowerComponents = './bower_components/';

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
                module: 'app.common',
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

    return config;
};