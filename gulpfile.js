var gulp = require('gulp-param')(require('gulp'), process.argv);
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
var path = require('path');

var mode = 'dev';
var templateMode = 'js';


gulp.task('clean', function(){
    return del.sync(['build/**/*']);
});


gulp.task('moveFiles', ['clean'], function(){
    return gulp.src(['./app/**/*'])
        .pipe(gulp.dest('./build'));
});


gulp.task('inject', ['moveFiles', 'less'], function () {
    var target = gulp.src('./app/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./build/app.js', './build/feat/**/*.js', './build/feat/**/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./build'));
});

gulp.task('less', function () {
    return gulp.src([
        './app/bower_components/bootstrap/less/variables.less',
        './app/bower_components/bootstrap/less/mixins.less',

       './app/bower_components/bootstrap/less/normalize.less',
        './app/bower_components/bootstrap/less/print.less',
        //'./app/bower_components/bootstrap/less/glyphicons.less',

     //   './app/bower_components/bootstrap/less/scaffolding.less',
     //   './app/bower_components/bootstrap/less/type.less',
        './app/bower_components/bootstrap/less/code.less',
        './app/bower_components/bootstrap/less/grid.less',
        './app/bower_components/bootstrap/less/tables.less',
        './app/bower_components/bootstrap/less/forms.less',
        './app/bower_components/bootstrap/less/buttons.less',

        // Components
        /*       "./app/bower_components/bootstrap/less/component-animations.less",
        "./app/bower_components/bootstrap/less/dropdowns.less",
        "./app/bower_components/bootstrap/less/button-groups.less",
        "./app/bower_components/bootstrap/less/input-groups.less",
        "./app/bower_components/bootstrap/less/navs.less",
        "./app/bower_components/bootstrap/less/navbar.less",
        "./app/bower_components/bootstrap/less/breadcrumbs.less",
        "./app/bower_components/bootstrap/less/pagination.less",
        "./app/bower_components/bootstrap/less/pager.less",
        "./app/bower_components/bootstrap/less/labels.less",
        "./app/bower_components/bootstrap/less/badges.less",
        "./app/bower_components/bootstrap/less/jumbotron.less",
        "./app/bower_components/bootstrap/less/thumbnails.less",
        "./app/bower_components/bootstrap/less/alerts.less",
        "./app/bower_components/bootstrap/less/progress-bars.less",
        "./app/bower_components/bootstrap/less/media.less",
        "./app/bower_components/bootstrap/less/list-group.less",
        "./app/bower_components/bootstrap/less/panels.less",
        "./app/bower_components/bootstrap/less/responsive-embed.less",
        "./app/bower_components/bootstrap/less/wells.less",
        "./app/bower_components/bootstrap/less/close.less",

        // Components w/ JavaScript
        "./app/bower_components/bootstrap/less/modals.less",
        "./app/bower_components/bootstrap/less/tooltip.less",
        "./app/bower_components/bootstrap/less/popovers.less",
        "./app/bower_components/bootstrap/less/carousel.less",

        // Utility classes
        "./app/bower_components/bootstrap/less/utilities.less",
        "./app/bower_components/bootstrap/less/responsive-utilities.less"
  */      ])
        .pipe(less({
            paths: [ path.join(__dirname, 'less', 'includes') ]
        }))
        .pipe(concat('bootstrap.css'))
        .pipe(minCss())
        .pipe(gulp.dest('./build/css'));
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


gulp.task('pInject', ['vendor', 'js', 'pTemplates', 'less'], function () {
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


gulp.task('dev', function () {
    mode = 'dev';
    return gulp.run('inject');
});

gulp.task('default', function (mod, templ, help) {

    console.log(mod, templ, help);
    if (help || (mod && mod !== 'prod' && mod !== 'dev') || (templ && templ !== 'ajax' && templ !== 'js')) {

        console.log("Usage: gulp [options]" +
        "\n  Options:" +
        "\n    -m { dev | prod } (default: dev)" +
        "\n       dev  : development build, no optimization" +
        "\n       prod : production build, with optimizations like minification and obfuscation" +
        "\n    -t { ajax | js } (default: ajax)" +
        "\n       ajax : the templates are just copied in the build directory and requested as needed" +
        "\n       js   : the templates are injected in the angular templateCache and served as one js file" +
        "");
        return;
    }

    templateMode = templ || 'ajax';
    mode = mod || 'dev';


    return gulp.run(mode);
});

