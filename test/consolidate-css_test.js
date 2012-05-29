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
      'test/fixtures/test.html'
    ];

    var dest = 'tmp/min.css';
    // tests here
    grunt.helper('consolidateCss', files, dest);
    var outCss = dest + '/file1,file2,subdir$file2.min.css';
    test.ok(path.existsSync(outCss), "Output CSS is missing: "+outCss);
    test.equal(grunt.file.read(outCss),
               'test output');

    outCss = dest + '/file2,file1,subdir$file2.min.css';
    grunt.helper('consolidateCss', files, dest, { sort:false });
    test.ok(path.existsSync(outCss), "Output CSS is missing: "+outCss);
    test.equal(grunt.file.read(outCss),
               'test output');

    test.done();
  }
};
