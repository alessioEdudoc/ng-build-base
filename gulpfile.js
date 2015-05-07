var gulp = require('gulp-param')(require('gulp'), process.argv),
    bump = require('gulp-bump'),
    fs = require('fs'),
    merge = require('merge-stream'),
    path = require('path'),
    glob = require('glob'),
    _ = require('underscore'),
    inject = require('gulp-inject'),
    less = require('gulp-less'),
    buster = require('gulp-buster'),
    replace = require('gulp-replace'),
    del = require('del'),
    watch = require('gulp-watch'),
    karma = require('gulp-karma'),
    plato = require('gulp-plato'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    jedit = require('gulp-json-editor'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngdoc = require('gulp-ngdocs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    minifyCss = require('gulp-minify-css'),
    minifyHtml = require('gulp-minify-html'),
    html2js = require('gulp-html2js')
    ;


var vendor = require('./src/vendor.json');


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




gulp.task('clean', ['jshint'], function(){
    return del.sync(['build']);
});


gulp.task('vendor', ['clean'], function(){
    return gulp.src(['src/vendor/**'])
        .pipe(gulp.dest('build/vendor'));
});

gulp.task('assets', ['clean'], function(){
    return gulp.src(['src/assets/**'])
        .pipe(gulp.dest('build/assets'));
});


gulp.task('less', ['clean'],function(){
    return gulp.src([
        'src/modules/**/*.less'
    ])
        .pipe(less())
        .pipe(gulp.dest('build/styles'));
});


gulp.task('js', ['clean'],function(){

    return gulp.src([
        '!./**/*.test.js',
        'src/modules/**/*.js'
    ])
        .pipe(ngAnnotate())
        .pipe(gulp.dest('build/modules'));

});



gulp.task('template-list', ['js'], function(){

    var entries = [],
        keys = [],
        files = glob.sync('src/modules/**/features/**/*.html');

    _.forEach(files, function(filePath){
        var dir = 'src/';
        var relativePath = filePath.substring(filePath.indexOf(dir)+dir.length);

        var arr = relativePath.split('/');

        var module = arr[1];
        var feature = arr[3];
        var templ = arr[arr.length-1].replace('.html', '');

        var key = module + "_" + feature + "_" + templ;

        key = key.toUpperCase();

        if (_.contains(keys, key)) {
            throw "Template key collision: more than one template with key '"+key+"'";
        }
        keys.push(key);
        entries.push("  " + key + " : '" + relativePath + "'");
    });


    files = glob.sync('src/modules/**/common/directives/**/*.html');

    _.forEach(files, function(filePath){
        var dir = 'src/';
        var relativePath = filePath.substring(filePath.indexOf(dir)+dir.length);

        var arr = relativePath.split('/');

        var module = arr[1];
        var directive = arr[4];
        var templ = arr[arr.length-1].replace('.html', '');
        var key = module + "_" + directive + "_" + templ;
        if (_.contains(keys, key)) {
            throw "Template key collision: more than one template with key '"+key+"'";
        }
        keys.push(key);
        entries.push("  " + key + " : '" + relativePath + "'");
    });



    // taking the list from the sources
    return gulp.src('build/modules/_templ/template-list.js')
        .pipe(replace('/*##TEMPLATE_LIST##*/', entries.join(',\n')))
        .pipe(ngAnnotate())
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

gulp.task('index', ['vendor', 'assets', 'less', 'templates', 'meta', 'template-list', 'js'],function(){

    var src = [
        './build/styles/*.css',
        './build/styles/**/*.css',
        './build/modules/*.js',
        './build/modules/**/*.js'
    ];


    return gulp.src('src/index.html')
        .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->'))
        .pipe(injectIntoIndex(vendor.head.dev, '<!-- vendor:head:{{ext}} -->'))
        .pipe(injectIntoIndex(vendor.body.dev, '<!-- vendor:body:{{ext}} -->'))
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


gulp.task('dev', ['build', 'meta-align', 'ngdoc', 'karma']);


// ============================= TEST =============================== //


gulp.task('karma', ['build'],function(){

    var vendorFiles = vendor.head.dev.concat(vendor.body.dev);

    // filter out non testable files
    vendorFiles = _.filter(vendorFiles, function(file){
        return !file.match(/\.css$|modernizr/);
    });

    vendorFiles = _.map(vendorFiles, function(file){
        return file.replace('./build/', 'build/');
    });

    var testFiles = vendorFiles.concat([

        'build/vendor/angular-mocks/angular-mocks.js', // mocks

        'build/modules/*.js',
        'build/modules/**/*.js',
        'src/modules/**/*.test.js'     // then, include the test specs
    ]);

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
        .pipe(jscs())   // code style check
        .pipe(jshint())
        .pipe(jshint.reporter('cool-reporter'))
        .pipe(jshint.reporter('fail'));
});




//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                         PROD TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//

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

var minifyHtmlOptions = {
        empty : false, // - do not remove empty attributes
            cdata : false, // - do not strip CDATA from scripts
        comments : false, // - do not remove comments
        conditionals : true, // - do not remove conditional internet explorer comments
        spare : false, // - do not remove redundant attributes
        quotes : false, // - do not remove arbitrary quotes
        loose : false // - preserve one whitespace
    };


gulp.task('html2js-prod', ['dev'], function(){

    return gulp.src([
        'build/modules/**/*.html'
    ])
        .pipe(minifyHtml(minifyHtmlOptions))
        .pipe(html2js({
            outputModuleName : '_templ',
            singleModule : true,
            base : 'build/'
        }))
        .pipe(concat('templates.min.js'))
        .pipe(gulp.dest('build/modules/_templ/html2js'));

});


gulp.task('js-prod', ['html2js-prod', 'dev'], function(){

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


gulp.task('css-prod', ['dev'], function(){

    return gulp.src([
        'build/styles/*.css',
        'build/styles/**/*.css'
    ])
        .pipe(concat('styles.min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('build/css'))
        .pipe(buster())
        .pipe(gulp.dest('.'));

});


gulp.task('index-prod', ['js-prod', 'css-prod', 'dev'],function(){

    var src = [
        './build/css/*.min.css',
        './build/js/*.min.js'
    ];


    var str = fs.readFileSync('./busters.json', "utf8");
    var hashes = JSON.parse(str);


    return gulp.src('src/index.html')
        .pipe(injectIntoIndex(src, '<!-- inject:{{ext}} -->', hashes))
        .pipe(injectIntoIndex(vendor.head.prod, '<!-- vendor:head:{{ext}} -->', hashes))
        .pipe(injectIntoIndex(vendor.body.prod, '<!-- vendor:body:{{ext}} -->', hashes))
        .pipe(minifyHtml(minifyHtmlOptions))
        .pipe(gulp.dest('build'));


});


gulp.task('prod', ['js-prod', 'css-prod', 'index-prod', 'dev'], function(version){

        del.sync([
            'build/styles',
            'build/modules'
        ]);

        var options = {};
        if (!version) {
            options = {
                preid: 'build',
                type: 'prerelease'
            };
        }
        else if (version.match(/major|minor|patch|prerelease|build/)) {
            options = {
                preid: 'build',
                type: version
            };
        }
        else if (version.match(/\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
            options = {
                version: version
            };
        }
        else {
            throw "--version (-v) should be major|minor|patch|prerelease|build or a Semver version number (e.g. 1.0.2)";
        }

    var curStream = gulp.src(['bower.json', 'package.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('.'));

    var srcStream = gulp.src(['src/meta.json'])
        .pipe(bump(options))
        .pipe(gulp.dest('src'));

    return merge (curStream, srcStream);
});


//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//
//                                     DOCUMENTATION TASKS
//0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000//


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










var parser = require('esprima');


var recipeHasName = function (recipe) {
    return _.contains(['directive','service','factory','constant','controller'], recipe);
};

gulp.task('test', function() {


    var entries = [];


    var files = glob.sync('src/modules/**/*.js');


    var cnt = {
        config : 0,
        run : 0
    };


    _.forEach(files, function(filePath){

        if (filePath.match(/\.test\.js$/))
            return;

        console.log(filePath);
        var file = fs.readFileSync(filePath);

        var tree = parser.parse(file, {comment:true, attachComment:true});


        var subTrees = findSubTrees(tree);
        for (var i=0; i<subTrees.length; ++i)
            console.log(subTrees[i].cmt.range, subTrees[i].cmt.value);

        return;////////////////////////////////////////////######################################################


        if (isModuleDefinition(tree))
            return; ////////////////////////////////// Overview and special deps


        var recipeType = getRecipeType(tree),
            entry = {
                type : recipeType,
                deps : getFuncArgDeps(tree, recipeType),
                module : getModuleName(tree),
                name :  getRecipeName(tree, recipeType),

                restrict : getAttr(tree, 'restrict'),
                priority : getAttr(tree, 'priority'),
                scope : isAttrDefined(tree, 'scope')
            };

        entry.fullName = entry.module + '.' + entry.type + ':' + (entry.name ? entry.name : entry.type+'_'+(cnt[entry.type]++));

        entries.push(entry);
        
    });


  

    _.forEach(entries, function(entry){
       

        var str = '@ngdoc ' + (entry.type.match(/run|config/) ? 'object' : entry.type) +
            '\n * @name ' + entry.fullName;

        if (entry.scope)
            str += '\n * @scope';

        if (entry.restrict)
            str += '\n * @restrict ' + entry.restrict;

        if (entry.priority)
            str += '\n * @priority ' + entry.priority;

        _.forEach(entry.deps, function(dep){
            str += '\n * @requires ' + dep;
        });
            
        str += '\n * @description';

        console.log(str);


    });

});


function getFuncArgDeps(tree, recipe) {
    
    var ar;
    var hasName = recipeHasName(recipe);
    var parmIndex = hasName ? 1 : 0;
    _.forEach(tree, function(child){
        
         if (!child || ar)
            return;

         if (child.type==='CallExpression' && child.callee.property.name===recipe) {
            if (child.arguments[parmIndex].type==='FunctionExpression') { // if function form
                ar = _.pluck(child.arguments[parmIndex].params, 'name');
                return false;
            }
            else if (child.arguments[parmIndex].type==='ArrayExpression') { // if annotated form
                ar = _.pluck(_.where(child.arguments[parmIndex].elements, {type:'Literal'}), 'value');
                return false;
            }
         } else {
            if(_.isObject(child) || _.isArray(child))
               ar = getFuncArgDeps(child, recipe);
         }
    });
    return ar;
}

function getModuleName(tree) {
    var res = '';
    _.forEach(tree, function(child){
        if (res) 
            return false;
         if (child && child.type==='CallExpression' && child.callee.property.name==='module') {
             res = child.arguments[0].value;
             return false;
         } else {
            if(_.isObject(child) || _.isArray(child))
                res = getModuleName(child); 
         }
    });
    return res;
}




function getRecipeName(tree, recipe) {
    
    var res = '';
    _.forEach(tree, function(child){
        if (res) 
            return false;

         if (child && child.type==='CallExpression' && child.callee.property.name===recipe) {
             res = child.arguments[0].value;
             return false;
         } else {
            if(_.isObject(child) || _.isArray(child))
               res = getRecipeName(child, recipe);
         }
    });
    return res;
}


function getRecipeType(tree) {
    
    var res = '';
    _.forEach(tree, function(child){
        if (res) 
            return false;

         if (child && child.type==='CallExpression' && child.callee.property.name==='module') {
             res = tree.property.name;
             return false;
         } else {
            if(_.isObject(child) || _.isArray(child))
               res = getRecipeType(child);
         }
    });
    return res;
}


function getAttr(tree, attr) {
    var res = '';
    _.forEach(tree, function(child){
         if (child && child.type==='ObjectExpression') {
            if (res) 
                return false;
            _.forEach(child.properties, function(prop){
                if ((prop.key.type==='Identifier' && prop.key.name===attr) || (prop.key.type==='Literal' && prop.key.value===attr)) {
                    res = prop.value.value;
                    return;
                }
            });
         } else {
            if(_.isObject(child) || _.isArray(child))
               res = getAttr(child, attr);
         }
    });
    return res;
}

function isAttrDefined(tree, attr) {
    var res = false;
    _.forEach(tree, function(child){
         if (child && child.type==='ObjectExpression') {
            if (res) 
                return res;
            _.forEach(child.properties, function(prop){
                if ((prop.key.type==='Identifier' && prop.key.name===attr) || (prop.key.type==='Literal' && prop.key.value===attr)) {
                    res = true;
                    return;
                }
            });
         } else {
            if(_.isObject(child) || _.isArray(child))
               res = isAttrDefined(child, attr);
         }
    });
    return res;
}

function isModuleDefinition(tree) {
    var res = false;
    _.forEach(tree, function(child){
        if (res) 
            return res;

         if (child && child.type==='CallExpression' && child.callee.property.name==='module') {
            console.log();
             if (child.arguments.length===2 && child.arguments[1].type==='ArrayExpression')
                res = true;
             return;
         } else {
            if(_.isObject(child) || _.isArray(child))
               res = isModuleDefinition(child);
         }
    });
    return res;
}







function findSubTrees(tree) {

    var res = [];

    function visit(tree) {

        if (!_.isArray(tree) && !_.isObject(tree))
            return;
       
        if (tree && tree.leadingComments) {

            var ngdocComment;
             _.forEach(tree.leadingComments, function(cmt){
                if (ngdocComment)
                    return;

                if (cmt.value.match(/@ngdoc/))
                    ngdocComment = cmt;
           

                
             });

             

             if (ngdocComment) {
                //console.log(ngdocComment.value);
                tree.cmt = ngdocComment;
                res.push(tree);
             }
                
        }
            

        _.forEach(tree, function(child){
            
            visit(child);
        });
    }

    visit(tree);

    return res;
}


