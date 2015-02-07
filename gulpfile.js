var gulp = require('gulp');
var config = require('./gulp.config')();
var args = require('yargs').argv;
var del = require('del');
var $ = require('gulp-load-plugins')({
    lazy: true //now all gulp plugins can acces by $.plugin name without "gulp" ex. "gulp-jshint" -> "$.jshint"
});
var port = process.env.PORT || config.defaultPort;
var browserSync = require('browser-sync');

/*
 * List the available gulp tasks
 */

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

///////////////////////////////////////////////////////////////////
//  Server dev
///////////////////////////////////////////////////////////////////

gulp.task('server-dev', ['inject'], function() {
    serve(true);
});

///////////////////////////////////////////////////////////////////
//  Server build
///////////////////////////////////////////////////////////////////

gulp.task('server-build', ['optimize'], function() {
    serve(false);
});

///////////////////////////////////////////////////////////////////
//  Template cache
///////////////////////////////////////////////////////////////////

gulp.task('clean-code', function(done) {
    var files = [].concat(
        config.temp + '**/*.js',
        config.build + '**/*.html',
        config.build + 'js/**/*.js'
    );
    clean(files, done);
});

gulp.task('templatecache', ['clean-code'], function() {
    log('Create AngularJS templatecache');

    return gulp
        .src(config.htmlTemplates)
        .pipe($.minifyHtml({
            empty: true
        }))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
});

///////////////////////////////////////////////////////////////////
//  Optimization
///////////////////////////////////////////////////////////////////

gulp.task('optimize', ['inject', 'fonts', 'images'], function() {
    log('Optimize HTML, JS, CSS');

    var templateCache = config.temp + config.templateCache.file;
    var assets = $.useref.assets({
        searchPath: '/'
    });
    var cssFilter = $.filter('**/*.*css');
    var jsAppFilter = $.filter('**/app.js');
    var jsLibFilter = $.filter('**/lib.js');

    return gulp
        .src(config.index)
        .pipe($.plumber())
        .pipe($.inject(gulp.src(templateCache, {
            read: false
        }), {
            starttag: '<!-- inject:tamplates:js -->'
        }))
        // get all assets from index.html surrounded by <!-- build -->> 
        .pipe(assets)
        // filter Css
        .pipe(cssFilter)
        // Optimize and minify CSS
        .pipe($.csso())
        .pipe(cssFilter.restore())
        // filter Js for app
        .pipe(jsAppFilter)
        // inject dependencies for angular
        .pipe($.ngAnnotate())
        .pipe($.uglify())
        .pipe(jsAppFilter.restore())
        // filter Js for Lib
        .pipe(jsLibFilter)
        // Optimize and minify JS
        .pipe($.uglify())
        .pipe(jsLibFilter.restore())
        // add revision number app.js --> app-2f22s2.js
        .pipe($.rev())
        .pipe(assets.restore())
        // inject all optimized dependencies 
        .pipe($.useref())
        // inject new review link to html
        .pipe($.revReplace())
        .pipe(gulp.dest(config.build))
        // add manifest.json for revision
        .pipe($.rev.manifest())
        .pipe(gulp.dest(config.build));

});

///////////////////////////////////////////////////////////////////
//  Injectors
///////////////////////////////////////////////////////////////////

gulp.task('wiredep', function() {
    log('Write .js and bower js and css into index.html');

    var options = config.getWiredepDefaultOptions();
    var wiredep = require('wiredep').stream;

    return gulp
        .src(config.index)
        .pipe(wiredep(options))
        .pipe($.inject(gulp.src(config.js)))
        .pipe(gulp.dest(config.client));
});

gulp.task('inject', ['wiredep', 'styles', 'templatecache'], function() {
    log('Wire CSS from LESSS and do "wiredep" taks');

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(config.css)))
        .pipe(gulp.dest(config.client));
});

///////////////////////////////////////////////////////////////////
//  Styles - CSS, LESSS
///////////////////////////////////////////////////////////////////

gulp.task('styles', ['clean-styles'], function() {
    log('Compiling LESS --> CSS');
    return gulp
        .src(config.less)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.plumber())
        .pipe($.less())
        .pipe($.autoprefixer({
            browsers: ['last 2 versions', '> 5%']
        }))
        .pipe(gulp.dest(config.temp));
});

gulp.task('clean-styles', function(done) {
    var files = [
        config.temp + '**/*.css',
        config.build + 'styles',
    ];
    clean(files, done);
});

gulp.task('watch-styles', function() {
    gulp.watch([config.less], ['styles']);
});

///////////////////////////////////////////////////////////////////
//  Task for analyzing code
///////////////////////////////////////////////////////////////////

gulp.task('vet', function() {
    log('Analyzing source with JSHint and JSCS');

    return gulp
        .src(config.alljs)
        .pipe($.if(args.verbose, $.print()))
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {
            verbose: true
        }))
        .pipe($.jshint.reporter('fail'));
});

///////////////////////////////////////////////////////////////////
//  Fonts
///////////////////////////////////////////////////////////////////

gulp.task('fonts', ['clean-fonts'], function() {
    log('Copying fonts');
    log(config.fonts);
    log(config.build);
    return gulp
        .src(config.fonts)
        .pipe(gulp.dest(config.build + 'fonts/'))
        .pipe($.if(args.verbose, $.print()));

});

gulp.task('clean-fonts', function(done) {
    var files = config.build + 'fonts/*.*';
    clean(files, done);
});

///////////////////////////////////////////////////////////////////
//  Images
///////////////////////////////////////////////////////////////////

gulp.task('images', ['clean-images'], function() {
    log('Copying and compressing images');
    log(config.images);
    log(config.build);
    return gulp
        .src(config.images)
        .pipe($.imagemin({
            optimizationLevel: 4
        }))
        .pipe(gulp.dest(config.build + 'images/'))
        .pipe($.if(args.verbose, $.print()));

});

gulp.task('clean-images', function(done) {
    var files = config.build + 'images';
    clean(files, done);
});

///////////////////////////////////////////////////////////////////
//  Helper
///////////////////////////////////////////////////////////////////

gulp.task('clean', function(done) {
    var delconfig = [].concat(config.build, config.temp);
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
});

function serve(isDev) {
    var nodeOptions = {
        script: config.nodeServer,
        delayTime: 1,
        env: {
            'PORT': port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch: [config.server]
    };

    return $.nodemon(nodeOptions)
        .on('restart', function(ev) {
            log('*** Nodemon restarted ***');
            log('files changed on restart: \n' + $.util.colors.green(ev));

            setTimeout(function() {
                browserSync.notify('reloading now');
                browserSync.reload({
                    stram: false
                });
            }, config.browserReloadDelay);
        })
        .on('start', function() {
            log('*** Nodemon started ***');
            startBrowserSync(isDev);
        })
        .on('crash', function() {
            log('*** Nodemon crash ***');
        })
        .on('exit', function() {
            log('*** Nodemon exit cleanly ***');
        });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function startBrowserSync(isDev) {

    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch([config.less], ['styles'])
            .on('change', function(event) {
                changeEvent(event);
            });
    } else {
        gulp.watch([config.less, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', function(event) {
                changeEvent(event);
            });
    }

    var options = {
        proxy: 'localhost:' + port,
        port: 3000,
        files: isDev ? [
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
        ] : [],
        ghostMode: {
            clicks: true,
            location: false,
            forms: true,
            scroll: true
        },
        injectChanges: true,
        logFileChanges: true,
        logLevel: 'debug',
        logPrefix: 'Log BrowserSync: ',
        notify: true,
        reloadDelay: 1000,
        browser: 'google chrome',
    };

    browserSync(options);

}

function log(msg) {
    if (typeof msg === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }
}

function clean(path, done) {
    log('Cleaning: ' + $.util.colors.blue(path));
    del(path, done);
}