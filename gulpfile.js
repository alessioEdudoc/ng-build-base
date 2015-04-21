var gulp = require('gulp');
var inject = require('gulp-inject');
var del = require('del');



var mode = 'dev';


gulp.task('clean', function(){
    return del.sync(['build/**/*']);
});


gulp.task('moveFiles', ['clean'], function(){
    return gulp.src(['./app/**/*'])
        .pipe(gulp.dest('./build'));
});


gulp.task('inject', ['moveFiles'], function () {
    var target = gulp.src('./build/index.html');
    // It's not necessary to read the files (will speed up things), we're only after their paths:
    var sources = gulp.src(['./build/feat/**/*.js', './build/feat/**/*.css'], {read: false});

    return target.pipe(inject(sources))
        .pipe(gulp.dest('./build'));
});


// build tasks

gulp.task('dev', function () {
    mode = 'dev';
    return gulp.run('inject');
});


