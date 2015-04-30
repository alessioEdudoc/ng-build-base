module.exports = {

    bustCache : {

        type : 'hash',      // hash | timestamp
        paramKey : 'v',     // parameter key (e.g. 'rev' -> 'path/to/file.ext?rev=hash')

        opts : {
            fileName : 'busters.json',
            length : 12,
            algo : 'md5'    // accepts every algorythm accepted by crypto.createHash()
        },
        templates : true,   // enable bust cache for templates
        scripts : true,     // enable bust cache for scripts
        styles : true       // enable bust cache for stylesheets
    },

    styles : {
        concat : true,
        minify : {
            advanced : true, // - set to false to disable advanced optimizations - selector & property merging, reduction, etc.
            aggressiveMerging : true, // - set to false to disable aggressive merging of properties.
            benchmark : false, // - turns on benchmarking mode measuring time spent on cleaning up (run npm run bench to see example)
            compatibility : false, //- enables compatibility mode,
            debug : false, // - set to true to get minification statistics under stats property (see test/custom-test.js for examples)
            inliner : false, // - a hash of options for @import inliner, see test/protocol-imports-test.js for examples
            keepBreaks : false, // - whether to keep line breaks (default is false)
            keepSpecialComments : false, // - * for keeping all (default), 1 for keeping first one only, 0 for removing all
            mediaMerging : true, // - whether to merge @media blocks (default is true)
            processImport : true, // - whether to process @import rules
            rebase : false, // - set to false to skip URL rebasing
//            relativeTo : '', // - path to resolve relative @import rules and URLs
            restructuring : true, // - set to false to disable restructuring in advanced optimizations
//            root : '', // - path to resolve absolute @import rules and rebase relative URLs
            roundingPrecision : 2, // - rounding precision; defaults to 2; -1 disables rounding
            shorthandCompacting : true, // - set to false to skip shorthand compacting (default is true unless sourceMap is set when it's false)
            sourceMap : false, // - exposes source map under sourceMap property, e.g. new CleanCSS().minify(source).sourceMap (default is false) If input styles are a product of CSS preprocessor (LESS, SASS) an input source map can be passed as a string.
            sourceMapInlineSources : false // - set to true to inline sources inside a source map's sourcesContent field (defaults to false) It is also required to process inlined sources from input source maps.
//            target : '' // - path to a folder or an output file to which rebase all URLs
        }
    },

    scripts : {
        concat : true,
        minify : {
            mangle: ['angular'],

            output: {
                indent_start: 0,     // start indentation on every line (only when `beautify`)
                indent_level: 4,     // indentation level (only when `beautify`)
                quote_keys: false, // quote all keys in object literals?
                space_colon: true,  // add a space after colon signs?
                ascii_only: false, // output ASCII-safe? (encodes Unicode characters as ASCII)
                inline_script: false, // escape "</script"?
                width: 80,    // informative maximum line width (for beautified output)
                max_line_len: 32000, // maximum line length (for non-beautified output)
            //    ie_proof: true,  // output IE-safe code?
                beautify: false, // beautify output?
                source_map: null,  // output a source map
                bracketize: false, // use brackets every time?
                comments: false, // output comments?
                semicolons: true  // use semicolons to separate statements? (otherwise, newl
            },
            compress: {
                sequences: true,  // join consecutive statemets with the “comma operator”
                properties: true,  // optimize property access: a["foo"] → a.foo
                dead_code: true,  // discard unreachable code
                drop_debugger: true,  // discard “debugger” statements
                unsafe: false, // some unsafe optimizations (see below)
                conditionals: true,  // optimize if-s and conditional expressions
                comparisons: true,  // optimize comparisons
                evaluate: true,  // evaluate constant expressions
                booleans: true,  // optimize boolean expressions
                loops: true,  // optimize loops
                unused: true,  // drop unused variables/functions
                hoist_funs: true,  // hoist function declarations
                hoist_vars: false, // hoist variable declarations
                if_return: true,  // optimize if-s followed by return/continue
                join_vars: true,  // join var declarations
                cascade: true,  // try to cascade `right` into `left` in sequences
                side_effects: true,  // drop side-effect-free statements
                warnings: true,  // warn about potentially dangerous optimizations/code
                global_defs: {}     // global definitions
            },
            preserveComments: false // 'some', 'all'
        }
    },

    templates : {
        minify : {
            empty : false, // - do not remove empty attributes
            cdata : false, // - do not strip CDATA from scripts
            comments : false, // - do not remove comments
            conditionals : true, // - do not remove conditional internet explorer comments
            spare : false, // - do not remove redundant attributes
            quotes : false, // - do not remove arbitrary quotes
            loose : false // - preserve one whitespace
        },
        html2js : {
            base: 'app/',               // the base for the template
            outputModuleName: 'myApp',  // the module name to use
            useStrict: true             // use strict
        }
    },


    watch : {
        interval : 100,
        debounceDelay : 200
    }

};