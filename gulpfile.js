var gulp = require('gulp-param')(require('gulp'), process.argv),
    path = require('path'),
    fs = require('fs'),
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


    mode,
    templateMode
    ;


var conf = {

    CONST : {
        MODE : {
            PROD : 'prod',
            DEV : 'dev'
        },
        TEMPLATE_MODE : {
            JS: 'js',
            AJAX: 'ajax'
        },
        BUST_MODE : {
            HASH : 'hash',
            TIMESTAMP : 'timestamp'
        }
    },


    minify : {
        templates : true,
        scripts : true,
        styles : true
    },


    bustCache : {

        type : 'timestamp',
        paramKey : 'v',

        opts : {
            fileName : 'busters.json',
            length : 12,
            algo : 'md5'
        },

        templates : true,
        scripts : true,
        styles : true


    },

    watch : {
        interval : 100,
        debounceDelay : 200
    }
};



var task = {

    clean : function(){
        return del.sync(['build/**/*']);
    },

    less : function () {
        var stream = gulp.src('./app/less/styles.less')
            .pipe(less())
            .pipe(iff(mode==='prod', function(){return concat('styles.css')}))
            .pipe(iff(conf.minify.styles, minCss))
            .pipe(gulp.dest('./build/css'));
        if (conf.bustCache.styles)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    vendor : function () {
        return gulp.src(['./app/bower_components/**/*'])
            .pipe(gulp.dest('./build/bower_components'));
    },

    js : function () {

        var stream;
        if (mode === 'prod') {
            stream = gulp.src(['./app/app.js', './app/feat/**/*.js'])
                .pipe(concat('app.min.js'));

            if (conf.minify.scripts)
                stream.pipe(ngAnnotate()).pipe(uglify());

            stream.pipe(gulp.dest('./build/js'));

        }
        else if (mode === 'dev') {
            stream = gulp.src(['./app/app.js', './app/fea*/**/*.js'])
                .pipe(gulp.dest('./build/js'));
        }

        if (conf.bustCache.scripts)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    templates : function() {

        var stream;
        if (templateMode === 'js') {
            stream = gulp.src('./app/feat/**/*.html')
                .pipe(iff(conf.minify.templates, minHtml))
                .pipe(html2js({
                    base: 'app/',
                    outputModuleName: 'myApp',
                    useStrict: true
                }))
                .pipe(concat('template.js'))
                .pipe(iff(conf.minify.scripts, ngAnnotate))
                .pipe(iff(conf.minify.scripts, uglify))
                .pipe(gulp.dest('./build/js'))
                ;
        } else {
            stream = gulp.src('./app/feat/**/*.html')
                .pipe(iff(conf.minify.templates, minHtml))
                .pipe(gulp.dest('./build/feat'))
                ;
        }
        if (conf.bustCache.templates)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    inject : function () {



        var target = gulp.src('./app/index.html');
        // It's not necessary to read the files (will speed up things), we're only after their paths:
        var sources = (mode==='prod') ?
                gulp.src(['./build/js/*.js', './build/css/*.css'], {read: false}) :
                gulp.src(['./build/js/*.js', './build/js/**/*.js', './build/css/*.css'], {read: false})
            ;


       // var hashes = require('./'+conf.bustCache.opts.fileName);
        var str = fs.readFileSync('./'+conf.bustCache.opts.fileName, "utf8");
        var hashes = JSON.parse(str);
        //console.log(str);


        var buildTime = Date.now().toString().substring(0, conf.bustCache.opts.length);

        return target
            .pipe(inject(sources, {
                read : false,
                transform : function (filepath) {

                    var buildDir = 'build/';
                    var relativePath = filepath.substring(filepath.indexOf(buildDir)+buildDir.length);
                    var normalizedPath = buildDir+relativePath;
                    var extension = path.extname(filepath);


                    var hash = (conf.bustCache.type === conf.CONST.BUST_MODE.HASH ? hashes[normalizedPath] : buildTime);


                    if (extension === '.js')
                        return '<script src="'+relativePath+(hash ? '?'+conf.bustCache.paramKey+'='+hash : '')+'"></script>';
                    if (extension === '.css')
                        return '<link rel="stylesheet" href="'+relativePath+(hash ? '?'+conf.bustCache.paramKey+'='+hash : '')+'">';
                }
            }))
            .pipe(iff(conf.minify.templates, minHtml))
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
    },

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
var through = require('through2');


gulp.task('watch', function (mod, templ, help) {

    task.default(mod, templ, help);

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

