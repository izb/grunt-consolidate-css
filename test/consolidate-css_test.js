var grunt = require('grunt'),
    fs = require('fs'),
    path = require('path');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports['consolidateCss'] = {
  setUp: function(done) {
    // setup here
    path.exists('tmp/min.css', function(exists) {
      if (exists) {
        fs.rmdir('tmp/min.css', done);
      } else {
        done();
      }
    });
  },
  'helper': function(test) {
    test.expect(2);
    var files = [
      'test/fixtures/*.html'
    ];
    var dest = 'tmp/min.css';
    // tests here
    grunt.helper('consolidateCss', files, dest);
    test.equal(grunt.file.read(dest + '/file1,file2,subdir$file2.min.css'),
               'test output');

    grunt.helper('coffee', files, dest, { sort:false });
    test.equal(grunt.file.read(dest + '/file2,file1,subdir$file2.min.css'),
               'test output');

    test.done();
  }
};
