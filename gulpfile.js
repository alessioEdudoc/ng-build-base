var gulp = require('gulp-param')(require('gulp'), process.argv),
    fs = require('fs'),
    merge = require('merge-stream'),
    path = require('path'),
    glob = require('glob'),
    _ = require('underscore'),
    inject = require('gulp-inject'),
    less = require('gulp-less'),
    concat = require('gulp-concat'),
    replace = require('gulp-replace'),
    del = require('del'),
    watch = require('gulp-watch'),
    karma = require('gulp-karma'),
    plato = require('gulp-plato'),
    jshint = require('gulp-jshint'),
    jedit = require('gulp-json-editor'),
    ngdoc = require('gulp-ngdocs')
    ;



var injectIntoIndex = function(srcArray, starttag) {
    return inject(gulp.src(srcArray, {read : false}), {
        read : false,
        starttag : starttag,
        transform : function (filepath) {

            var buildDir = 'build/';
            var relativePath = filepath.substring(filepath.indexOf(buildDir)+buildDir.length);
            var normalizedPath = buildDir+relativePath;
            var extension = path.extname(filepath);



            if (extension === '.js')
                return '<script src="'+relativePath+'"></script>';
            if (extension === '.css')
                return '<link rel="stylesheet" href="'+relativePath+'">';
        }
    });
};




gulp.task('clean', ['jshint'], function(){
    return del.sync(['build']);
});


gulp.task('vendor', ['clean'], function(){
    return gulp.src(['src/vendor/**'])
        .pipe(gulp.dest('build/vendor'));
});


gulp.task('less', ['clean'],function(){
    return gulp.src([
        'src/modules/**/*.less'
        ])
        .pipe(less())
        .pipe(gulp.dest('build/css'));
});


gulp.task('js', ['clean'],function(){

    return gulp.src([
        '!./**/*.test.js',
        'src/modules/**/*.js'
    ]).pipe(gulp.dest('build/modules'));

});



gulp.task('template-list', ['js'], function(){

    var ar = [],
        files = glob.sync('src/modules/**/*.html');

    _.forEach(files, function(filePath){
        var dir = 'src/';
        var relativePath = filePath.substring(filePath.indexOf(dir)+dir.length);

        // FIXME common
        var modDir = 'modules',
            ftDir = 'features',
            tmpDir = 'templates';

        var module = filePath.substring(filePath.indexOf(modDir)+ftDir.length, filePath.indexOf(ftDir)-1);
        var feature = filePath.substring(filePath.indexOf(ftDir)+ftDir.length+1, filePath.indexOf(tmpDir)-1);
        var templ = filePath.substring(filePath.indexOf(tmpDir)+tmpDir.length+1, filePath.indexOf('.html'));
        ar.push("  " + module + "_" + feature + "_" + templ + " : '" + relativePath + "'");
    });


    // taking the list from the sources
    return gulp.src('build/modules/_templ/template-list.js')
        .pipe(replace('/*##TEMPLATE_LIST##*/', ar.join(',\n')))
        .pipe(gulp.dest('build/modules/_templ/'));
});

gulp.task('meta', ['js'], function(){

    var metaJson = fs.readFileSync('src/meta.json', 'utf8');
    return gulp.src('build/modules/_meta/meta.js')
        .pipe(replace('{/*##META_JSON##*/}', metaJson))
        .pipe(gulp.dest('build/modules/_meta'));

});

gulp.task('templates', ['clean'],function(){

    return gulp.src([
        'src/modules/**/*.html'
    ]).pipe(gulp.dest('build/modules'));

});

gulp.task('index', ['vendor', 'less', 'templates', 'meta', 'template-list', 'js'],function(){

    var src = [
        './build/css/*.css',
        './build/css/**/*.css',
        './build/modules/*.js',
        './build/modules/**/*.js'
    ];

    var vendorHead = [
        './build/vendor/html5-boilerplate/css/normalize.css',
        './build/vendor/html5-boilerplate/css/main.css',
        './build/vendor/html5-boilerplate/js/vendor/modernizr-2.6.2.min.js'
    ];

    var vendorBody = [
        './build/vendor/angular/angular.js',
        './build/vendor/angular-route/angular-route.js'
    ];

    return gulp.src('src/index.html')
        .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->'))
        .pipe(injectIntoIndex(vendorHead, '<!-- vendor:head:{{ext}} -->'))
        .pipe(injectIntoIndex(vendorBody, '<!-- vendor:body:{{ext}} -->'))
        .pipe(gulp.dest('build'));


});


gulp.task('meta-align', ['js'], function(){
    var meta = JSON.parse(fs.readFileSync('src/meta.json', 'utf8'));
    var bowerMeta = _.pick(meta, ['name', 'version', 'description', 'license', 'homepage']);
    var nodeMeta = _.pick(meta, ['name', 'version', 'description', 'license', 'repository']);

    var bowerStream = gulp.src('bower.json')
        .pipe(jedit(bowerMeta))
        .pipe(gulp.dest('.'));

    var nodeStream = gulp.src('package.json')
        .pipe(jedit(nodeMeta))
        .pipe(gulp.dest('.'));

    return merge(bowerStream, nodeStream);
});



gulp.task('build', ['clean', 'index', 'vendor', 'less', 'templates', 'template-list', 'js']);


gulp.task('default', ['build', 'meta-align', 'ngdoc']);


// ============================= TEST =============================== //


gulp.task('karma', ['build'],function(){

    var testFiles = [
        'build/vendor/angular/angular.js',
        'build/vendor/angular-route/angular-route.js',
        'build/vendor/angular-mocks/angular-mocks.js',
        'build/modules/*.js',
        'build/modules/**/*.js',
        'src/modules/**/*.test.js'     // then, include the test specs
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



gulp.task('plato', function() {

    var testFiles = [
        '!src/**/*.test.js', // exclude test js files
        'src/modules/*.js',
        'src/modules/**/*.js'

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

gulp.task('jshint', function() {

    var testFiles = [
        '!src/**/*.test.js', // exclude test js files
        'src/modules/*.js',
        'src/modules/**/*.js'
    ];

    return gulp.src(testFiles)
        .pipe(jshint())
        .pipe(jshint.reporter('cool-reporter'))
        .pipe(jshint.reporter('fail'));
});

gulp.task('ngdoc', function() {

    var testFiles = [
        '!src/**/*.test.js', // exclude test js files
        'src/modules/*.js',
        'src/modules/**/*.js'
    ];

    return gulp.src(testFiles)
        .pipe(ngdoc.process({
            html5Mode : false
        }))
        .pipe(gulp.dest('docs'));
});
