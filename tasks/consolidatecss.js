/*
 * grunt-consolidate-css
 * https://github.com/izb/grunt-consolidate-css
 *
 * Copyright (c) 2012 Ian Beveridge
 * Licensed under the MIT license.
 */


module.exports = function(grunt) {
    var path = require('path');
    var fs = require('fs');
    var exec = require('child_process').exec;

    var Batch = function(files, mergedName) {

        this.batch = files.slice(0);
        this.mergedName = mergedName;
        var _this = this;

        this.firstNonCSS = function() {
            for (var i = 0; i < _this.batch.length; i++) {
                if(_this.batch[i].substr(-4)===".css") {
                    continue;
                } else {
                    return i;
                }
            }
            return -1;
        };

        this.firstIsMinified = function() {
            return (_this.batch[0].substr(-8)===".min.css");
        };

        this.count = function() {
            return _this.batch.length;
        };

        batch.concatenate = function() {
            var joined = grunt.helper('concat', _this.batch);
            var outfile = path.join(destPath, options.cssdir, _this.mergedName + '.css');
            grunt.file.write(outfile, joined);
            _this.batch = [outfile];
        };

        batch.convert = function(idx, cb) {

        };

        batch.minify = function(idx, cb) {

        };

        return this;
    };

    path.joinUnix = function() {
        var result = arguments[0] || "";
        for (var i = 1; i < arguments.length; i++) {
            if (arguments[i] === undefined) {
                continue;
            }

            if (result.substr(-1) === '/') {
                if (arguments[i].indexOf('/') === 0) {
                    result += arguments[i].substring(0);
                } else {
                    result += arguments[i];
                }
            } else {
                if (arguments[i].indexOf('/') === 0) {
                    result += arguments[i];
                } else {
                    result += (result.length>0? '/' : '') + arguments[i];
                }
            }
        }
        return result;
    };

    var cssPathPattern = new RegExp(/href\s*=["'](.*)?["']/);
    var relPattern = new RegExp(/rel\s*=\s*["']stylesheet["']/);
    var leadingSpacePattern = new RegExp(/(\s*)./);

    var mergeNames = function(names) {
        names = names.slice(0);
        var name = "";
        for (var i = 0; i < names.length; i++) {
            names[i] = names[i].replace(/\//g, '$').replace(/\.css$/, '').replace(/\.scss$/, '').replace(/\.sass$/, '');
        }
        return names.join(',');
    };

    grunt.registerMultiTask('consolidatecss', 'Consolidates and minifies your CSS files on a per-page basis', function() {

        var dest = this.file.dest,
            options = this.data.options;

        var allfiles = grunt.file.expandFiles(this.file.src);
        grunt.helper('consolidatecss', allfiles, dest, options);

        if (grunt.task.current.errorCount) {
            return false;
        }
    });


    grunt.registerHelper('consolidatecss', function(srces, destPath, options, callback) {

        options = options || {};

        if (options.yuijarpath === undefined) {
            options.yuijarpath = path.join(__dirname, '..', 'bin/yuicompressor-2.4.7.jar');
        }

        if (options.min === undefined) {
            options.min = true;
        }

        if (options.cssdir === undefined) {
            options.cssdir = options.min ? 'css.min' : 'css';
        }

        try {
            fs.mkdirSync(path.resolve(destPath));
        } catch(e) {
            /* Folder exists. Ignore. */
        }

        var pageMap = {};
        var i, j;
        var killfiles = [];
        var batches = [];

        var fail = function(msg, cb) {
            if(options._neverfail) {
                /* Testing a unit test plugin with a unit test is tricky, because
                 * you can't test that the unit test framework failed a test, because
                 * it fails the test checking that the test was failed. Hmm.
                 * Anyway, that's why we have a backdoor flag for unit tests, passing
                 * failure messages back to the callback. */
                cb(msg);
                return true;
            }
            grunt.fail.fatal(msg);
            return false;
        };

        var isStyleSheetLine = function(line, callback) {
            if (line.indexOf('<link ') !== 0) {
                return false;
            }
            if (line.match(relPattern) === null) {
                return false;
            }
            if (line.indexOf('<link ', 1) !== -1) {
                fail("Only one link tag per line is permitted " + line, callback);
                return;
            }
            if (line.indexOf('>') !== line.length - 1) {
                fail("Link tags must not span multiple lines " + line, callback);
                return;
            }
            return true;
        };

//         var yuiProcess = function(resultFile, callback) {
//             resultFile = path.resolve(resultFile);

//             exec('java -jar "' + options.yuijarpath + '" --charset utf-8 --preserve-semi --line-break 150 -o "' + resultFile + '" "' + resultFile, function(err, stdout, stderr) {
//                 if (err) {
//                     fail("YUICompressor failed with error " + err, callback);
//                     return;
//                 }
//                 grunt.log.write(stdout);
//                 grunt.log.write(stderr);
//                 if (callback) {
//                     callback();
//                 }
//             });
//         };

//         var compressProc = function(files, callback) {
//             yuiProcess(files[0], function() {
//                 files = files.slice(1);
//                 if (files.length > 0) {
//                     compressProc(files, callback);
//                 } else {
//                     if (callback)
//                     {
//                         callback();
//                     }
//                 }
//             });
//         };

//         var scssProcess = function(scssFile, destDir, callback) {
//             scssFile = path.resolve(scssFile);

//             var syntaxFlag = "";

//             if(scssFile.substr(-4)===".css") {
//                 callback(scssFile, false);
//                 return;
//             }

//             if(scssFile.substr(-5)===".sass") {
//                 syntaxFlag = " --sass";
//             }

//             try {
//                 fs.mkdirSync(path.resolve(destDir));
//             } catch(e) {
//                 /* Folder exists. Ignore. */
//             }

//             var outfile = path.join(path.resolve(destDir), path.basename(scssFile))+'.css';

//             exec('scss -C' + syntaxFlag + ' ' + scssFile + ' > '+outfile, function(err, stdout, stderr) {
//                 if (err) {
//                     fail("scss converter failed with error " + err, callback);
//                     return;
//                 }
//                 grunt.log.write(stdout);
//                 grunt.log.write(stderr);
//                 if (callback) {
//                     callback(outfile, true);
//                 }
//             });
//         };

//         var scssProc = function(files, destDir, csslist, callback) {
//             scssProcess(files[0], destDir, function(outfile, kill) {
//                 if (kill) {
//                     killfiles.push(outfile);
//                 }
//                 csslist.push(outfile);
//                 files = files.slice(1);
//                 if (files.length > 0) {
//                     scssProc(files, destDir, csslist, callback);
//                 } else {
//                     if (callback)
//                     {
//                         callback(csslist, destDir);
//                     }
//                 }
//             });
//         };

//         var processConvertedFiles = function(processed, destDir) {
//             console.log('kill '+killfiles);

//             var joined = grunt.helper('concat', processed);
//             var yuifile = path.join(destPath, options.cssdir, mergedName);
//             grunt.file.write(yuifile, joined);
//             yuifiles.push(yuifile);
// console.log("YUIFILE "+yuifiles);
//         };

        try {
            for (j = 0; j < srces.length; j++) {

                var src = srces[j];
                var content = grunt.file.read(src);
                content = content.replace(/\r/g, '');
                content = content.split('\n');

                var consolidate = [];
                var output = [];
                var lastLineIndent = "";
                var yuifiles = [];

                for (var idx in content) {
                    var line = content[idx];
                    var cleanline = line.toLowerCase().trim();
                    if (isStyleSheetLine(cleanline, callback)) {
                        var cssPath = line.match(cssPathPattern);
                        if (cssPath !== null) {
                            cssPath = cssPath[1];
                            consolidate.push(cssPath);
                            var leading = line.match(leadingSpacePattern);
                            if (leading !== null) {
                                lastLineIndent = leading[1];
                            }
                        } else {
                            fail("Failed to extract href from stylesheet link " + cleanline, callback);
                            return;
                        }
                    } else if (consolidate.length > 0) {

                        var sorted = consolidate.slice(0).sort();
                        var sortedName = mergeNames(sorted);
                        var mergedName = mergeNames(consolidate);

                        var doGenFile = true;
                        if (pageMap.hasOwnProperty(sortedName)) {
                            if (pageMap[sortedName].mergedName === mergedName) { /* file already merged. */
                                doGenFile = false;
                            } else {
                                fail("Pages ref same CSS in different orders 1) " + pageMap[sortedName].page + " 2) " + src, callback);
                                return;
                            }
                        } else {
                            pageMap[sortedName] = {
                                mergedName: mergedName,
                                page: src
                            };
                        }

                        var basedir = path.dirname(src);

                        if (doGenFile) {

                            var concats = [];
                            for (i = 0; i < consolidate.length; i++) {
                                concats.push(path.join(basedir, consolidate[i]));
                            }

                            batches.push(new Batch(concats, mergedName));
                        }

                        consolidate = [];

                        output.push(lastLineIndent + '<link rel="stylesheet" type="text/css" href="' + path.joinUnix(options.pathPrefix, options.cssdir, mergedName) + '">');
                        output.push(line);

                    } else {
                        output.push(line);
                    }
                } /* for [css in html] */

                var dest = path.join(destPath, path.basename(src));
                grunt.file.write(dest, output.join('\n'));

            } /* for [html in input] */


            var processBatches = function(batches, terminate) {

                if (batches.length === 0) {
                    terminate();
                    return;
                }

                var batch = batches[0];

                var idx = batch.firstNonCSS();

                if (idx < 0) {
                    if (batch.count == 1) {
                        if (options.min && !batch.firstIsMinified()) {
                            /* One single CSS. minify it. */
                            batch.minify(0, function() {
                                /* This batch is done */
                                processBatches(batches.slice(1), terminate);
                            });
                        } else {
                            processBatches(batches.slice(1), terminate);
                        }
                    } else {
                        /* Batch has several pure CSS files. Concatenate them */
                        batch.concatenate();
                        /* Feed it back in to minify */
                        processBatches(batches, terminate);
                    }
                    /* Batch is all CSS. Concatenate them */
                } else {
                    batch.convert(idx, function() {
                        /* Feed it back in to get the next one */
                        processBatches(batches, terminate);
                    });
                }
            };

            if (batches.length > 0) {
                processBatches(batches, callback);
            } else {
                callback();
            }

        } catch (e) {
            grunt.log.error("Unable to consolidate CSS", e);
        }
    });

};
