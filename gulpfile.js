var gulp = require('gulp-param')(require('gulp'), process.argv),
    path = require('path'),
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

    mode = 'dev',
    templateMode = 'js'
    ;

var hashes = {

};


var task = {

    clean : function(){
        return del.sync(['build/**/*']);
    },

    less : function () {
        return gulp.src('./app/less/styles.less')
            .pipe(less())
            .pipe(iff(mode==='prod', function(){return concat('styles.css')}))
            .pipe(iff(mode==='prod',minCss))
            .pipe(gulp.dest('./build/css'));
    },

    vendor : function () {
        return gulp.src(['./app/bower_components/**/*'])
            .pipe(gulp.dest('./build/bower_components'));
    },

    js : function () {

        if (mode === 'prod') {
            return gulp.src(['./app/app.js', './app/feat/**/*.js'])
                .pipe(concat('app.min.js'))
                .pipe(ngAnnotate())
                .pipe(uglify())
                .pipe(gulp.dest('./build/js'));
        }
        else if (mode === 'dev') {
            return gulp.src(['./app/app.js', './app/fea*/**/*.js'])
                .pipe(gulp.dest('./build/js'));
        }
    },

    templates : function() {

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
                .pipe(gulp.dest('./build/js'))
                ;
        } else {
            return gulp.src('./app/feat/**/*.html')
                .pipe(iff(mode==='prod', minHtml))
                .pipe(gulp.dest('./build/feat'));
        }
    },

    inject : function () {


        var target = gulp.src('./app/index.html');
        // It's not necessary to read the files (will speed up things), we're only after their paths:
        var sources = (mode==='prod') ?
                gulp.src(['./build/js/*.js', './build/css/*.css'], {read: false}) :
                gulp.src(['./build/js/*.js', './build/js/**/*.js', './build/css/*.css'], {read: false})
            ;



        return target
            .pipe(inject(sources, {
                read : false,
                transform : function (filepath) {
                   // var normalizedPath = path.normalize(filepath);
                    var buildDir = 'build/';
                    var relativePath = filepath.substring(filepath.indexOf(buildDir)+buildDir.length);
                    var extension = path.extname(filepath);
                    var hash = 'HASH';//hashes[normalizedPath];
                    if (extension === '.js')
                        return '<script src="'+relativePath+'?v='+hash+'"></script>';
                    if (extension === '.css')
                        return '<link rel="stylesheet" href="'+relativePath+'?v='+hash+'">';
                }
            }))
            .pipe(iff(mode==='prod', minHtml))
            .pipe(gulp.dest('./build'));

    },

    default : function (mod, templ, help) {

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
    }
};



// dependency definition

gulp.task('clean', task.clean);
gulp.task('less', ['clean'], task.less);
gulp.task('vendor', ['clean'], task.vendor);
gulp.task('js', ['clean'], task.js);
gulp.task('templates', ['clean'], task.templates);
gulp.task('inject', ['vendor', 'js','templates','less'], task.inject);


// build tasks

gulp.task('default', task.default);



// watched tasks

gulp.task('watch', function (mod, templ, help) {

    task.default(mod, templ, help);


    var options = {
        interval : 100,
        debounceDelay : 200
    };


    gulp.watch('./app/less/*.less', options, function(){
        console.log('watch less: ');
        task.less();
        task.inject();
    });

    gulp.watch('./app/feat/**/*.html', options, function(){
        console.log('watch html: ');
        task.templates();
        task.inject();
    });

    gulp.watch(['./app/app.js', './app/feat/**/*.js'], options, function(){
        console.log('watch js: ');
        task.js();
        task.inject();
    });

});

