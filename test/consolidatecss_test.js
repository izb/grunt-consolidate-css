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

var yuipath = "C:/Users/Ian/AppData/Roaming/Sublime Text 2/Packages/YUI Compressor/bin/yuicompressor-2.4.7.jar";

exports['consolidatecss'] = {
    setUp: function(done) {
        // setup here
        var dir = 'tmp/min.css';
        path.exists(dir, function(exists) {
            if (exists) {
                fs.readdir(dir, function(err, files) {
                    for (var i = 0; i < files.length; i++) {
                        fs.unlinkSync(path.join(dir, files[i]));
                    }
                    done();
                });
            }
        });
    },
    consolidateSimple: function(test) {
        test.expect(1);
        var files = ['test/fixtures/test.html'];

        var dest = 'tmp/min.css';

        grunt.helper('consolidatecss', files, dest, {
            yuijarpath: yuipath
        }, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');
            test.equal(grunt.file.read(outCss),
                   '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.done();
        });
    }
};
