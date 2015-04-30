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
    bust = require('gulp-buster')
    ;

var conf;   // will contain the configuration object

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

        stream.pipe(gulp.dest('./build/css'));

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
        if (conf.scripts.minify) {
            stream = gulp.src(['./app/app.js', './app/feat/**/*.js'])
                .pipe(concat('app.min.js'));

            if (conf.scripts.minify)
                stream.pipe(ngAnnotate()).pipe(uglify(conf.scripts.minify));

            stream.pipe(gulp.dest('./build/js'));

        }
        else {
            stream = gulp.src(['./app/app.js', './app/feat/**/*.js'])
                .pipe(gulp.dest('./build/feat'));
        }

        if (conf.bustCache.scripts)
            return stream.pipe(bust(conf.bustCache.opts)).pipe(gulp.dest('.'));
        return stream;
    },

    templates : function() {

        var stream;
        if (conf.templates.html2js) {
            stream = gulp.src('./app/feat/**/*.html');

            if (conf.templates.minify)
                stream.pipe(minHtml(conf.templates.minify));

            stream.pipe(html2js(conf.templates.html2js))
                .pipe(iff(conf.scripts.concat, function(){return concat('template.js')}))
                .pipe(iff(conf.scripts.minify, ngAnnotate))
                .pipe(iff(conf.scripts.minify, uglify))
                .pipe(gulp.dest('./build/js'))
                ;
        } else {
            stream = gulp.src('./app/feat/**/*.html')
                .pipe(iff(conf.templates.minify, function(){ return minHtml(conf.templates.minify)}))
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
            .pipe(gulp.dest('./build'));

    },

    default : function (mod, templ, help, c) {

        c = c || 'prod';
        conf = require('./gulp/'+c+'.conf.js');

        if (help) {
            console.log("Usage: gulp [options]" +
                "\n  Options:" +
                "\n    -c <config> (default: -c prod)" +
                "\n       launches gulp with the selected configuration file" +
                "\n       (e.g. 'prod' uses the file 'gulp/prod.conf.js') " +
                "");
            return;
        }

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

