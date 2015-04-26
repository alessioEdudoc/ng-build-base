var gulp = require('gulp-param')(require('gulp'), process.argv);
var inject = require('gulp-inject');
var uglify = require('gulp-uglify');
var ngAnnotate = require('gulp-ng-annotate');
var html2js = require('gulp-html2js');
var minHtml = require('gulp-minify-html');
var minCss = require('gulp-minify-css');
var less = require('gulp-less');
var concat = require('gulp-concat');
var del = require('del');
var iff = require('gulp-if-else');


var mode = 'dev';
var templateMode = 'js';


var antiCache = Date.now();




gulp.task('clean', function(){
    return del.sync(['build/**/*']);
});



gulp.task('inject', ['vendor', 'js','templates','less'], function () {


    var target = gulp.src('./app/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var jsSources = (mode==='prod') ?
            gulp.src(['./build/js/*.js'], {read: false}) :
            gulp.src(['./build/app.js', './build/feat/**/*.js'], {read: false})
        ;
    var cssSources = gulp.src('./build/css/*.css');

    return target
        .pipe(inject(jsSources, {
            read        : false,
            starttag    : '<!-- inject:js -->',
            addRootSlash: false,
            transform: function (filepath) {
                //converts build/src/app/**/*.js   --->   src/app/**/*.js'
                var filename = filepath.split('/').splice(1).join('/');

                return '<script src="'+ filename +'?v=' + antiCache + '"></script>';
            }
        }))
        .pipe(inject(cssSources, {
            read        : false,
            starttag    : '<!-- inject:css -->',
            addRootSlash: false,
            transform: function (filepath) {

                //converts build/src/app/**/*.js   --->   src/app/**/*.js'
                var filename = filepath.split('/').splice(1).join('/');

                return '<link rel="stylesheet" href="'+ filename +'?v=' + antiCache + '">';
            }
        }))
        .pipe(minHtml())
        .pipe(gulp.dest('./build'));

});

gulp.task('less', ['clean'], function () {
    return gulp.src('./app/less/styles.less')
        .pipe(less())
        .pipe(iff(mode==='prod', function(){return concat('styles.css')}))
        .pipe(iff(mode==='prod',minCss))
        .pipe(gulp.dest('./build/css'));
});


// production tasks

gulp.task('vendor', ['clean'], function () {
    return gulp.src(['./app/bower_components/**/*'])
        .pipe(gulp.dest('./build/bower_components'));
});


gulp.task('js', ['clean'], function () {

    if (mode === 'prod') {
        return gulp.src(['./app/app.js', './app/feat/**/*.js'])
            .pipe(concat('app.min.js'))
            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(gulp.dest('./build/js'));
    }
    else if (mode === 'dev') {
        return gulp.src(['./app/app.js', './app/**/*.js'])
            .pipe(gulp.dest('./build'));
    }
});




gulp.task('templates', ['clean'], function() {

    if (templateMode === 'js') {
        return gulp.src('./app/feat/**/*.html')
            .pipe(iff(mode==='prod',minHtml))
            .pipe(html2js({
                base: 'app/',
                outputModuleName: 'myApp',
                useStrict: true
            }))
            .pipe(concat('template.js'))
            .pipe(iff(mode==='prod',ngAnnotate))
            .pipe(iff(mode==='prod', uglify))
            .pipe(iff(mode==='prod',
                function(){return gulp.dest('./build/js')},
                function(){return gulp.dest('./build/feat')}
            ));
    } else {
        return gulp.src('./app/feat/**/*.html')
            .pipe(iff(mode==='prod', minHtml))
            .pipe(gulp.dest('./build/feat'));
    }
});



// build tasks


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


    return gulp.run('inject');
});

