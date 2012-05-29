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

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('consolidatecss', 'Consolidates and minifies your CSS files on a per-page basis', function() {

    var dest = this.file.dest,
        options = this.data.options;

    grunt.file.expandFiles(this.file.src).forEach(function(filepath) {
      grunt.helper('consolidatecss', filepath, dest, options);
    });

    if (grunt.task.current.errorCount) {
      return false;
    }
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  var cssPathPattern = new RegExp(/href\s*=["'](.*)?["']/);
  var relPattern = new RegExp(/rel\s*=\s*["']stylesheet["']/);
  var leadingSpacePattern = new RegExp(/(\s*)./);

  var isStyleSheetLine = function(line) {
    /* TODO: Violating some of these should fail the build. */
    if(line.indexOf('<link ')!==0) {
        return false;
    }
    if (line.match(relPattern) === null) {
        return false;
    }
    if(line.indexOf('<link ', 1)!==-1) {
        grunt.fail.fatal("Only one link tag per line is permitted "+line);
    }
    if (line.indexOf('>') !== line.length - 1) {
        grunt.fail.fatal("Link tags must not span multiple lines "+line);
    }
    return true;
  };

  var mergeNames = function(names) {

    names = names.slice(0);
    var name = "";
    for (var i = 0; i < names.length; i++) {
        names[i] = names[i].replace(/\//g, '$').replace(/\.css$/, '');
    }
    return names.join(',') + '.min.css';
  };


  grunt.registerHelper('consolidatecss', function(src, destPath, options) {

    options = options || {};
    if( options.sort !== false ) {
      options.sort = true;
    }

    var pageMap = {};

    try {
        var consolidate = [];
        var output = [];
        var lastLineIndent = "";
        var content = grunt.file.read(src);
        content = content.replace(/\r/g, '');
        content = content.split('\n');
        for(var idx in content) {
            var line = content[idx];
            var cleanline = line.toLowerCase().trim();
            if (isStyleSheetLine(cleanline)) {
                var cssPath = line.match(cssPathPattern);
                if (cssPath !== null) {
                    cssPath = cssPath[1];
                    consolidate.push(cssPath);
                    var leading = line.match(leadingSpacePattern);
                    if (leading !== null) {
                        lastLineIndent = leading[1];
                    }
                } else {
                    grunt.fail.fatal("Failed to extract href from stylesheet link "+cleanline);
                }
            } else if(consolidate.length >0) {

                var sorted = consolidate.slice(0).sort();
                var sortedName = mergeNames(sorted);
                var mergedName = mergeNames(consolidate);

                var doGenFile = true;
                if (pageMap.hasOwnProperty(sortedName)) {
                    if (pageMap[sortedName].mergedName === mergedName) {
                        /* file already merged. */
                        doGenFile = false;
                    } else {
                        grunt.fail.fatal("Pages ref same CSS in different orders 1) "+pageMap[sortedName].page+" 2) "+src);
                    }
                } else {
                    pageMap[sortedName] = {mergedName:mergedName, page:src};
                }

                if (doGenFile)
                {
                    /* TODO: Create the CSS */
                }

                consolidate = [];

                output.push(lastLineIndent + '<link rel="stylesheet" type="text/css" href="'+mergedName+'">');
                output.push(line);

            } else {
                output.push(line);
            }
        }

        var dest = path.join(destPath, path.basename(src));
        grunt.file.write(dest, output.join('\n'));

    } catch (e) {
      grunt.log.error("Unable to consolidate CSS", e);
    }
  });

};
