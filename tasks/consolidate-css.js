/*
 * grunt-consolidate-css
 * https://github.com/izb/grunt-consolidate-css
 *
 * Copyright (c) 2012 Ian Beveridge
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
  var path = require('path');

  // Please see the grunt documentation for more information regarding task and
  // helper creation: https://github.com/cowboy/grunt/blob/master/docs/toc.md

  // ==========================================================================
  // TASKS
  // ==========================================================================

  grunt.registerMultiTask('consolidateCss', 'Consolidates and minifies your CSS files on a per-page basis', function() {

    var dest = this.file.dest,
        options = this.data.options;

    grunt.file.expandFiles(this.file.src).forEach(function(filepath) {
      grunt.helper('consolidateCss', filepath, dest, options);
    });

    if (grunt.task.current.errorCount) {
      return false;
    }
  });

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  grunt.registerHelper('consolidateCss', function(src, destPath, options) {

    options = options || {};
    if( options.sort !== false ) {
      options.sort = true;
    }

    try {
      /* TODO: Do the work */
      /* Save to dest */
    } catch (e) {
      grunt.log.error("Unable to consolidate CSS", e);
    }
  });

};
