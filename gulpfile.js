var gulp = require('gulp');
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var html2js = require('gulp-html2js');
var minHtml = require('gulp-minify-html');
var minCss = require('gulp-minify-css');
var less = require('gulp-less');
var concat = require('gulp-concat');
var rename = require('gulp-rename2');
var del = require('del');


var mode = 'dev';
var templateMode = 'js';


gulp.task('clean', function(){
    return del.sync(['build/**/*']);
});


gulp.task('moveFiles', ['clean'], function(){
    return gulp.src(['./app/**/*'])
        .pipe(gulp.dest('./build'));
});


gulp.task('inject', ['moveFiles'], function () {
    var target = gulp.src('./app/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./build/app.js', './build/feat/**/*.js', './build/feat/**/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./build'));
});


// production tasks

gulp.task('vendor', ['clean'], function () {
    return gulp.src(['./app/bower_components/**/*'])
        .pipe(gulp.dest('./build/bower_components'));
});


gulp.task('js', ['clean'], function () {
    return gulp.src(['./app/app.js', './app/feat/**/*.js'])
        .pipe(concat('app.min.js'))
        .pipe(ngAnnotate())
        .pipe(uglify())
        .pipe(gulp.dest('./build/js'));
});


gulp.task('pInject', ['vendor', 'js', 'pTemplates'], function () {
    var target = gulp.src('./app/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./build/js/*.js', './build/css/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./build'));
});


gulp.task('pTemplates', function() {

    if (templateMode === 'js') {
        gulp.src('./app/feat/**/*.html')
            /*  .pipe(rename(function (pathObj, filePath) {
             return pathObj.join(
             // remove leading 'app/' directory from the file path
             pathObj.dirname(filePath).replace('app/feat/',''),
             // replace '.coffee' file extension with '.js'
             pathObj.dirname(filePath).replace('tmpl/','')
             );
             }))  */
            .pipe(minHtml())
            .pipe(html2js({
                base: 'app/',
                outputModuleName: 'myApp',
                useStrict: true
            }))
            .pipe(concat('template.js'))
            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(gulp.dest('./build/js'));
    } else {

        gulp.src('./app/feat/**/*.html')
            .pipe(minHtml())
            .pipe(gulp.dest('./build/feat'));

    }
});

gulp.task('pMinifyIndex', ['pInject'], function () {
    return gulp.src('./build/index.html')
        .pipe(minHtml())
        .pipe(gulp.dest('./build'));
});

// build tasks

gulp.task('prod', ['vendor', 'js', 'pInject', 'pTemplates', 'pMinifyIndex']);

gulp.task('prod-js', function () {
    templateMode = 'js';
    return gulp.run('prod');
});

gulp.task('prod-ajax', function () {
    templateMode = 'ajax';
    return gulp.run('prod');
});


gulp.task('dev', function () {
    mode = 'dev';
    return gulp.run('inject');
});


