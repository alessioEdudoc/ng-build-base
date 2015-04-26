var gulp = require('gulp-param')(require('gulp'), process.argv),
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
    Bust = require('gulp-bust'),

    bust,

    mode = 'dev',
    templateMode = 'js'
    ;





gulp.task('clean', function(){
    return del.sync(['build/**/*']);
});


gulp.task('less', ['clean'], function () {
    return gulp.src('./app/less/styles.less')
        .pipe(less())
        .pipe(iff(mode==='prod', function(){return concat('styles.css')}))
        .pipe(iff(mode==='prod',minCss))
        .pipe(bust.resources())
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
            .pipe(bust.resources())
            .pipe(gulp.dest('./build/js'));
    }
    else if (mode === 'dev') {
        return gulp.src(['./app/app.js', './app/fea*/**/*.js'])
            .pipe(bust.resources())
            .pipe(gulp.dest('./build/js'));
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
            .pipe(bust.resources())
            .pipe(gulp.dest('./build/js'))
            ;
    } else {
        return gulp.src('./app/feat/**/*.html')
            .pipe(iff(mode==='prod', minHtml))
            .pipe(gulp.dest('./build/feat'));
    }
});


gulp.task('inject', ['vendor', 'js','templates','less'], function () {


    var target = gulp.src('./app/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = (mode==='prod') ?
            gulp.src(['./build/js/*.js', './build/css/*.css'], {read: false}) :
            gulp.src(['./build/js/*.js', './build/js/**/*.js', './build/css/*.css'], {read: false})
        ;


    return target
        .pipe(inject(sources, {read : false }))
        .pipe(iff(mode==='prod', minHtml))
        .pipe(bust.references())
        .pipe(gulp.dest('./build'));

});


// build tasks


gulp.task('default', function (mod, templ, help) {


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


    bust = new Bust({
        hashLength: 12,
        hashType: 'md5',
        production: true
    });


    return gulp.run('inject');
});

