/*
 * grunt-consolidate-css
 * https://github.com/izb/grunt-consolidate-css
 *
 * Copyright (c) 2012 Ian Beveridge
 */


module.exports = function(grunt) {
    var path = require('path');
    var fs = require('fs');
    var exec = require('child_process').exec;

    var _this = this;

    this.rmdirs = function(dir, cb){
        path.exists(dir, function(exists) {
            if (exists) {
                fs.readdir(dir, function(err, files){
                    if (err) {
                        return cb(err);
                    }

                    var rmFile = function(err) {

                        if (err) {
                            return cb(err);
                        }

                        var filename = files.shift();

                        if (filename === null || typeof filename === 'undefined') {
                            return fs.rmdir(dir, cb);
                        }

                        var file = dir+'/'+filename;
                        fs.stat(file, function(err, stat){
                            if (err) {
                                return cb(err);
                            }

                            if (stat.isDirectory()) {
                                _this.rmdirs(file, rmFile);
                            } else {
                                fs.unlink(file, rmFile);
                            }
                        });
                    };

                    rmFile();
                });
            } else {
                cb();
            }
        });
    };


    var Batch = function(options, subdir, files, mergedName) {

        this.batch = files.slice(0);
        this.options = options;
        this.subdir = subdir;
        this.mergedName = mergedName;
        var _this = this;

        this.firstNonCSS = function() {
            for (var i = 0; i < _this.batch.length; i++) {
                if(_this.batch[i].substr(-4)!==".css") {
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

        this.concatenate = function(destPath, killfiles) {
            var joined = grunt.helper('concat', _this.batch);
            var outfile = path.join(destPath, _this.mergedName + '.css');
            grunt.file.write(outfile, joined);
            _this.batch = [outfile];
            if (options.min) {
                killfiles.push(outfile);
            }
        };

        this.copyBatchTo = function(outdir, killfiles) {
            for (var i = 0; i < _this.batch.length; i++) {
                var name = _this.batch[i];
                var out = path.join(outdir, name);
                var tmpdir = path.dirname(out.substr((path.join(outdir, '/')).length));
                grunt.file.copy(path.join(_this.options.basedir, name), out);
                _this.batch[i] = out;
                killfiles.push(out);
                if (tmpdir !== '.') {
                    killfiles.push(path.dirname(out));
                }
            }
        };

        this.convert = function(fail, killfiles, destPath, idx, cb) {
            var infile = path.resolve(_this.batch[idx]);
            var outfile = "";

            var syntaxFlag = "";
            if(infile.substr(-5)===".sass") {
                syntaxFlag = " --sass";
                outfile = path.basename(infile, '.sass') + '.css';
            } else {
                outfile = path.basename(infile, '.scss') + '.css';
            }
            outfile = path.join(path.dirname(infile), outfile);

            try {
                fs.mkdirSync(path.resolve(destPath));
            } catch(e) {
                /* Folder exists. Fine, ignore. */
            }

            exec('scss -C' + syntaxFlag + ' ' + infile + ' > '+outfile, function(err, stdout, stderr) {
                if (err) {
                    fail("scss converter failed with file "+infile+"with error " + err, cb);
                    return;
                }
                killfiles.push(outfile);
                _this.batch[idx] = outfile;
                grunt.log.write(stdout);
                grunt.log.write(stderr);
                cb();
            });
        };

        this.minify = function(fail, destPath, yuijarpath, idx, cb) {
            var filename = _this.batch[idx];
            var infile = path.resolve(filename);
            var outfile = path.basename(filename, '.css') + '.min.css';
            outfile = path.join(destPath, outfile);

            exec('java -jar "' + yuijarpath + '" --charset utf-8 --preserve-semi --line-break 150 -o "' + outfile + '" "' + infile, function(err, stdout, stderr) {
                if (err) {
                    fail("YUICompressor failed with error " + err, cb);
                    return;
                }
                grunt.log.write(stdout);
                grunt.log.write(stderr);
                cb();
            });
        };

        return this;
    };

    path.joinUnix = function() {
        var result = arguments[0] || "";

        for (var i = 1; i < arguments.length; i++) {
            var next = arguments[i];
            if (next !== undefined) {
                next = next.replace(/\\/g, '/');

                if (result.substr(-1) === '/') {
                    if (next.indexOf('/') === 0) {
                        result += next.substring(0);
                    } else {
                        result += next;
                    }
                } else {
                    if (next.indexOf('/') === 0) {
                        result += next;
                    } else {
                        result += (result.length>0? '/' : '') + next;
                    }
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
            names[i] = names[i].replace(/\\/g, '$').replace(/\//g, '$').replace(/\.css$/, '').replace(/\.scss$/, '').replace(/\.sass$/, '');
        }
        return names.join(',');
    };

    grunt.registerMultiTask('consolidatecss', 'Consolidates and minifies your CSS files on a per-page basis', function() {

        var options = this.data.options;

        var allfiles = grunt.file.expandFiles(this.file.src);
        grunt.helper('consolidatecss', allfiles, options);

        if (grunt.task.current.errorCount) {
            return false;
        }
    });


    grunt.registerHelper('consolidatecss', function(srces, options, callback) {

        options = options || {};

        var fail = function(msg, cb) {
            if(options._neverfail) {
                /* Testing a unit test plugin with its own unit test app is tricky, because
                 * you can't test that the unit test framework correctly failed a test, because
                 * it fails the test checking that the test was failed. Hmm.
                 * Anyway, that's why we have a backdoor flag for unit tests, passing
                 * failure messages back to the callback. */
                cb(msg);
                return true;
            }
            grunt.fail.fatal(msg);
            return false;
        };

        if (options.yuijarpath === undefined) {
            options.yuijarpath = path.join(__dirname, '..', 'bin/yuicompressor-2.4.7.jar');
        }

        if (options.min === undefined) {
            options.min = true;
        }

        if (options.cssdir === undefined) {
            options.cssdir = options.min ? 'css.min' : 'css';
        }

        if (options.intermediates === undefined) {
            options.intermediates = false;
        }

        if (options.basedir === undefined) {
            fail("basedir option is required for grunt-consolidate-css plugin", callback);
        }

        if (options.dest === undefined) {
            fail("dest option is required for grunt-consolidate-css plugin", callback);
        }
        var destPath = options.dest;

        options.basedir = path.join(options.basedir, "\\");

        try {
            fs.mkdirSync(path.resolve(destPath));
        } catch(e) {
            /* Folder exists. Ignore. */
        }

        var pageMap = {};
        var i, j;
        var killfiles = [];
        var batches = [];

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

        try {
            for (j = 0; j < srces.length; j++) {

                var src = path.join(options.basedir, srces[j]);
                src = path.normalize(src);

                if (src.indexOf(options.basedir) !== 0) {
                    /* After normalization, .. parts of the path could bring it out of the basedir */
                    fail(src +" must be in a subdir of basedir ("+options.basedir+")");
                    return;
                }

                var pagedir = path.dirname(src).substr(options.basedir.length);

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
                            cssPath = path.join(pagedir, cssPath[1]);

                            if (path.join(options.basedir, cssPath).indexOf(options.basedir) !== 0) {
                                fail(cssPath +" must be in a subdir of basedir ("+options.basedir+")");
                                return;
                            }

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
                        /* Non-link line, but we've just passed some, so process what we have so far */

                        var sorted = consolidate.slice(0).sort();
                        var sortedName = mergeNames(sorted);
                        var mergedName = mergeNames(consolidate);

                        var doGenFile = true;
                        if (pageMap.hasOwnProperty(sortedName)) {
                            if (pageMap[sortedName].mergedName === mergedName) { /* file already merged. */
                                doGenFile = false;
                            } else {
                                fail("Pages ref same CSS in different orders 1) " + pageMap[sortedName].page.replace(/\\/g, '/') + " 2) " + src.replace(/\\/g, '/'), callback);
                                return;
                            }
                        } else {
                            pageMap[sortedName] = {
                                mergedName: mergedName,
                                page: src
                            };
                        }

                        var subdir = path.dirname(src);

                        if (doGenFile) {

                            var concats = [];
                            for (i = 0; i < consolidate.length; i++) {
                                concats.push(consolidate[i]);
                            }

                            batches.push(new Batch(options, subdir, concats, mergedName));
                        }

                        consolidate = [];


                        var pathJourney;
                        if(options.pathPrefix===undefined) {
                            var rootPath = "";
                            var stepsToRoot = pagedir.replace(/\\/g, '/').split('/').length;
                            while(pagedir.length>0 && stepsToRoot-->0) {
                                rootPath += "../";
                            }
                            pathJourney = path.join(rootPath, options.cssdir, mergedName);
                        } else {
                            pathJourney = path.joinUnix(options.pathPrefix, options.cssdir, mergedName);
                        }

                        pathJourney = pathJourney.replace(/\\/g, '/');

                        output.push(lastLineIndent + '<link rel="stylesheet" type="text/css" href="' + pathJourney + (options.min?'.min':'') + '.css">');
                        output.push(line);

                    } else {
                        output.push(line);
                    }
                } /* for [css in html] */

                var dest = path.join(destPath, src.substr(options.basedir.length));
                grunt.file.write(dest, output.join('\n'));

            } /* for [html in input] */

            var outdir = path.join(destPath, options.cssdir);
            if (path.normalize(outdir).indexOf(options.basedir) === 0) {
                fail("An output directory cannot be a subdirectory of the output directory ("+outdir+")");
                return;
            }

            var processBatches = function(batches, terminate) {

                if (batches.length === 0) {
                    terminate();
                    return;
                }

                var batch = batches[0];

                var idx = batch.firstNonCSS();

                if (idx < 0) {
                    if (batch.count() === 1) {
                        if (options.min && !batch.firstIsMinified()) {
                            /* One single CSS. minify it. */
                            batch.minify(fail, outdir, options.yuijarpath, 0, function() {
                                /* This batch is done */
                                processBatches(batches.slice(1), terminate);
                            });
                        } else {
                            processBatches(batches.slice(1), terminate);
                        }
                    } else {
                        /* Batch has several pure CSS files. Concatenate them */
                        batch.concatenate(outdir, killfiles);
                        /* Feed it back in to minify */
                        processBatches(batches, terminate);
                    }
                    /* Batch is all CSS. Concatenate them */
                } else {
                    batch.convert(fail, killfiles, destPath, idx, function() {
                        /* Feed it back in to get the next one */
                        processBatches(batches, terminate);
                    });
                }
            };

            batches.forEach(function(batch) {
                batch.copyBatchTo(outdir, killfiles);
            });

            var cleanup = function() {
                if (options.intermediates) {
                    callback();
                } else {
                    if (killfiles.length>0) {
                        path.exists(killfiles[0], function(exists) {
                            if (exists) {
                                fs.stat(killfiles[0], function(err, stat){
                                    if (err) {
                                        callback();
                                    }

                                    if (stat.isDirectory()) {
                                        _this.rmdirs(killfiles[0], function() {
                                            killfiles = killfiles.slice(1);
                                            cleanup();
                                        });
                                    } else {
                                        fs.unlink(killfiles[0], function() {
                                            killfiles = killfiles.slice(1);
                                            cleanup();
                                        });
                                    }
                                });
                            } else {
                                killfiles = killfiles.slice(1);
                                cleanup();
                            }
                        });
                    } else {
                        callback();
                    }
                }
            };

            if (batches.length > 0) {
                processBatches(batches, cleanup);
            } else {
                cleanup();
            }

        } catch (e) {
            grunt.log.error("Unable to consolidate CSS", e);
        }
    });

};
