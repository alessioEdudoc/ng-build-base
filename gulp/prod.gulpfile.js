var gulp = require('gulp'),
    fs = require('fs'),
    path = require('path'),
    del = require('del'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    html2js = require('gulp-html2js'),
    inject = require('gulp-inject'),
    buster = require('gulp-buster')
    ;



var injectIntoIndex = function(srcArray, starttag, hashes) {
    return inject(gulp.src(srcArray, {read : false}), {
        read : false,
        starttag : starttag,
        transform : function (filepath) {

            var buildDir = 'build/';
            var relativePath = filepath.substring(filepath.indexOf(buildDir)+buildDir.length);
            var normalizedPath = buildDir+relativePath;
            var extension = path.extname(filepath);


            var hash = hashes && hashes[normalizedPath];


            if (extension === '.js')
                return '<script src="'+relativePath+(hash ? '?v='+hash : '')+'"></script>';
            if (extension === '.css')
                return '<link rel="stylesheet" href="'+relativePath+(hash ? '?v='+hash : '')+'">';
        }
    });
};



var minifyJs = function(){
    return uglify({
        mangle : ['angular', 'module'],
        output : {
            indent_start  : 0,     // start indentation on every line (only when `beautify`)
            indent_level  : 4,     // indentation level (only when `beautify`)
            quote_keys    : false, // quote all keys in object literals?
            space_colon   : true,  // add a space after colon signs?
            ascii_only    : false, // output ASCII-safe? (encodes Unicode characters as ASCII)
            inline_script : false, // escape "</script"?
            width         : 80,    // informative maximum line width (for beautified output)
            max_line_len  : 32000, // maximum line length (for non-beautified output)
            beautify      : false, // beautify output?
            source_map    : null,  // output a source map
            bracketize    : false, // use brackets every time?
            comments      : false, // output comments?
            semicolons    : true  // use semicolons to separate statements? (otherwise, newlines)
        },
        compress : {
            sequences     : true,  // join consecutive statemets with the “comma operator”
            properties    : true,  // optimize property access: a["foo"] → a.foo
            dead_code     : true,  // discard unreachable code
            drop_debugger : true,  // discard “debugger” statements
            unsafe        : false, // some unsafe optimizations (see below)
            conditionals  : true,  // optimize if-s and conditional expressions
            comparisons   : true,  // optimize comparisons
            evaluate      : true,  // evaluate constant expressions
            booleans      : true,  // optimize boolean expressions
            loops         : true,  // optimize loops
            unused        : true,  // drop unused variables/functions
            hoist_funs    : true,  // hoist function declarations
            hoist_vars    : false, // hoist variable declarations
            if_return     : true,  // optimize if-s followed by return/continue
            join_vars     : true,  // join var declarations
            cascade       : true,  // try to cascade `right` into `left` in sequences
            side_effects  : true,  // drop side-effect-free statements
            warnings      : true,  // warn about potentially dangerous optimizations/code
            global_defs   : {}     // global definitions
        }
    });
};


gulp.task('html2js-prod',function(){

    return gulp.src([
        'build/modules/**/*.html'
    ])
    .pipe(minifyHtml())
    .pipe(html2js({
        outputModuleName : '_templ',
        singleModule : true
    }))
    .pipe(concat('templates.min.js'))
    .pipe(gulp.dest('build/modules/_templ/html2js'));

});


gulp.task('js-prod', ['html2js-prod'], function(){

    return gulp.src([

        'build/modules/*.js',       // first, module definition files
        'build/modules/**/*.js'     // then, module-related files
    ])
    .pipe(concat('app.min.js'))
    .pipe(gulp.dest('build/js'))
    .pipe(minifyJs())
    .pipe(gulp.dest('build/js'))
    .pipe(buster())
    .pipe(gulp.dest('.'));

});


gulp.task('css-prod',function(){

    return gulp.src([
        'build/css/*.css',
        'build/css/**/*.css'
    ])
    .pipe(concat('styles.min.css'))
    .pipe(minifyCss())
    .pipe(gulp.dest('build/styles'))
    .pipe(buster())
    .pipe(gulp.dest('.'));

});


gulp.task('index-prod', ['js-prod', 'css-prod'],function(){

    var src = [
        './build/styles/*.min.css',
        './build/js/*.min.js'
    ];

    var vendorHead = [
        './build/vendor/html5-boilerplate/css/normalize.css',
        './build/vendor/html5-boilerplate/css/main.css',
        './build/vendor/html5-boilerplate/js/vendor/modernizr-2.6.2.min.js'
    ];

    var vendorBody = [
        './build/vendor/angular/angular.min.js',
        './build/vendor/angular-route/angular-route.min.js'
    ];

    var str = fs.readFileSync('./busters.json', "utf8");
    var hashes = JSON.parse(str);


    return gulp.src('src/index.html')
        .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->', hashes))
        .pipe(injectIntoIndex(vendorHead, '<!-- vendor:head:{{ext}} -->', hashes))
        .pipe(injectIntoIndex(vendorBody, '<!-- vendor:body:{{ext}} -->', hashes))
        .pipe(gulp.dest('build'));


});


gulp.task('default', ['js-prod', 'css-prod', 'index-prod'], function(){

    return del.sync([
        //'build/css',
       // 'build/modules/**/*'
        ]);
});