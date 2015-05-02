var gulp = require('gulp-param')(require('gulp'), process.argv),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    util = require('gulp-util'),
    inject = require('gulp-inject'),
    uglify = require('gulp-uglify'),
    ngAnnotate = require('gulp-ng-annotate'),
    html2js = require('gulp-html2js'),
    minHtml = require('gulp-minify-html'),
    minCss = require('gulp-minify-css'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    del = require('del'),
    iff = require('gulp-if-else'),
    watch = require('gulp-watch'),
    bust = require('gulp-buster'),
    bumper = require('gulp-bump'),
    filesize = require('gulp-filesize'),
    jedit = require('gulp-json-editor'),
    karma = require('gulp-karma'),
    plato = require('gulp-plato')
    ;

var conf,       // will contain the configuration object
    bumpValue,  // the version bump type (major, minor, patch, prerelease) or the version number (e.g. '0.0.1')
    bumpKey     // can be 'version' (if passing the version to bump) or 'type' (if passing a bump type)
    ;


var showHelp = function(){
    util.log(util.colors.blue("Usage: gulp [options]" +
        "\n  Options:" +
        "\n" +
        "\n    -c <config> (default: -c prod)" +
        "\n       launches gulp with the selected configuration file" +
        "\n       (e.g. 'prod' uses the file 'gulp/prod.conf.js') " +
        "\n" +
        "\n    --bump   -b  { major | minor | patch | prerelease } (default: prerelease)" +
        "\n       bumps the version in the bower.json and in the package.json" +
        "\n" +
        "\n    --help   -h" +
        "\n       shows this help" +
        "\n" +
        "\n  Tasks:" +
        "\n    edit - edit common keys in package.json and bower.json" +
        "\n      -k (--key) <key>" +
        "\n         the key (name, description, version)" +
        "\n      -v (--value) <value>" +
        "\n         the new value" +
        "\n" +
        "\n    watch - start the watch mode" +
        "\n      -c <config> (default: -c prod)" +
        "\n         launches gulp with the selected configuration file" +
        "\n         (e.g. 'prod' uses the file 'gulp/prod.conf.js') " +
        ""));
};




var task = {

    clean : function(){
        return del.sync(['build/**/*']);
    },

    less : function () {
        var stream = gulp.src('./app/less/styles.less')
            .pipe(less());

        if (conf.styles.minify)
            stream.pipe(concat('styles.css'))
                .pipe(minCss(conf.styles.minify));

        stream.pipe(gulp.dest('./build/css'))
            .pipe(filesize());

        if (conf.bustCache.styles)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    vendor : function () {
        return gulp.src(['./app/bower_components/**/*'])
            .pipe(gulp.dest('./build/bower_components'));
    },

    js : function () {

        // takes all js files BUT the unit test files
        var stream;
        var sourceFiles = ['!./**/*.test.js', './app/app.js', './app/feat/**/*.js'];

        if (conf.scripts.minify) {
            stream = gulp.src(sourceFiles)
                .pipe(concat('app.min.js'))
                .pipe(ngAnnotate())
                .pipe(uglify(conf.scripts.minify))
                .pipe(gulp.dest('./build/js'))
                .pipe(filesize());
        }
        else {
            stream = gulp.src(sourceFiles)
                .pipe(gulp.dest('./build/feat'))
                .pipe(filesize());
        }

        if (conf.bustCache.scripts)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    templates : function() {

        var stream;
        var templateFiles = './app/feat/**/*.html';

        if (conf.templates.html2js) {
            stream = gulp.src(templateFiles)
                .pipe(iff(conf.templates.minify, function(){
                    return minHtml(conf.templates.minify);
                }))
                .pipe(html2js(conf.templates.html2js))
                .pipe(iff(conf.scripts.concat, function(){return concat('template.js')}))
                .pipe(iff(conf.scripts.minify, ngAnnotate))
                .pipe(iff(conf.scripts.minify, uglify))
                .pipe(gulp.dest('./build/js'))
                .pipe(filesize())
                ;
        } else {
            stream = gulp.src('./app/feat/**/*.html')
                .pipe(iff(conf.templates.minify, function(){ return minHtml(conf.templates.minify)}))
                .pipe(gulp.dest('./build/feat'))
                .pipe(filesize())
                ;
        }
        if (conf.bustCache.templates)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    inject : function () {

        var target = gulp.src('./app/index.html');
        // It's not necessary to read the files (will speed up things), we're only after their paths:
        var sources = gulp.src(['./build/js/*.js', './build/feat/**/*.js', './build/css/*.css'], {read: false});


        var str = fs.readFileSync('./'+conf.bustCache.opts.fileName, "utf8");
        var hashes = JSON.parse(str);


        var buildTime = Date.now().toString().substring(0, conf.bustCache.opts.length);

        return target
            .pipe(inject(sources, {
                read : false,
                transform : function (filepath) {

                    var buildDir = 'build/';
                    var relativePath = filepath.substring(filepath.indexOf(buildDir)+buildDir.length);
                    var normalizedPath = buildDir+relativePath;
                    var extension = path.extname(filepath);


                    var hash = (conf.bustCache.type === 'hash' ? hashes[normalizedPath] : buildTime);


                    if (extension === '.js')
                        return '<script src="'+relativePath+(hash ? '?'+conf.bustCache.paramKey+'='+hash : '')+'"></script>';
                    if (extension === '.css')
                        return '<link rel="stylesheet" href="'+relativePath+(hash ? '?'+conf.bustCache.paramKey+'='+hash : '')+'">';
                }
            }))
            .pipe(iff(conf.templates.minify, minHtml))
            .pipe(gulp.dest('./build'))
            .pipe(filesize());

    },


    bump : function () {

        if (!bumpKey || !bumpValue)
            return util.noop();

        var opts = {
            preid : 'build'
        };
        opts[bumpKey] = bumpValue;

        return gulp.src(['./package.json', './bower.json'])
            .pipe(bumper(opts))
            .pipe(gulp.dest('./'));
    },

    default : function (help, c, bump) {

        c = c || 'prod';
        conf = require('./gulp/'+c+'.conf.js');

        if (help) {
            showHelp();
            return;
        }

        if (bump !== false) {
            bump = bump || 'prerelease';
            if (!bump.match(/^(major|minor|patch|prerelease|\d\.\d\.\d)$/i)) {
                util.log(util.colors.red("Option -b --bump must be one of 'major', 'minor', 'patch', " +
                    "    'prerelease' or a Semver version number (like 0.1.2) (default: prerelease)"));
                return;
            }

            bumpKey = (bump.match(/^\d\.\d\.\d$/) ? 'version' : 'type')
            bumpValue = bump;
        }
        return gulp.run('bump');
    }

};


// dependency definition

// build tasks
gulp.task('clean', task.clean);
gulp.task('less', ['clean'], task.less);
gulp.task('vendor', ['clean'], task.vendor);
gulp.task('js', ['clean'], task.js);
gulp.task('templates', ['clean'], task.templates);
gulp.task('inject', ['vendor', 'js','templates','less'], task.inject);
gulp.task('bump', ['inject'], task.bump);

gulp.task('default', task.default); // main task


// help tasks
gulp.task('help', showHelp);
gulp.task('?', showHelp);

// edit common json metadata
gulp.task('edit', function (key, value) {

    var allowedKeys = ['name', 'version', 'description'];
    if (!_.contains(allowedKeys, key)) {
        util.log(util.colors.red("Possible -k (--key) values: '"+allowedKeys.join("','")+"'"));
        return;
    }
    var obj = {};
    obj[key] = value;
    return gulp.src(['./package.json', './bower.json'])
        .pipe(jedit(obj))
        .pipe(gulp.dest('./'));

});

// watched tasks

gulp.task('watch', function (c) {

    task.default(false, c, false);

    gulp.watch('./app/less/*.less', conf.watch, function(){
        console.log('watch less: ');
        task.less()
            .on('end', task.inject);

    });

    gulp.watch('./app/feat/**/*.html', conf.watch, function(){
        console.log('watch html: ');
        task.templates()
            .on('end', task.inject);
    });

    gulp.watch(['./app/app.js', './app/feat/**/*.js'], conf.watch, function(){
        console.log('watch js: ');
        task.js()
            .on('end', task.inject);
    });

});


// test tasks
gulp.task('test', ['karma','plato']);


gulp.task('plato', function() {

    var testFiles = [
        'app/app.js',
        'app/feat/**/!(*.test).js' // include non-test js files
    ];

    return gulp.src(testFiles)
        .pipe(plato('./report/complexity', {
            jshint: {
                options: {
                    strict: true
                }
            },
            complexity: {
                trycatch: true
            }
        }));
});

gulp.task('karma', function() {

    var testFiles = [
        'app/bower_components/angular/angular.js',
        'app/bower_components/angular-route/angular-route.js',
        'app/bower_components/angular-mocks/angular-mocks.js',
        'app/app.js',
        'app/feat/**/!(*.test).js', // first, include non-test js files
        'app/feat/**/*.test.js'     // then, include the test specs
    ];

    // Be sure to return the stream
    return gulp.src(testFiles)
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});
