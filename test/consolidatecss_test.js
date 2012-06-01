var grunt = require('grunt'),
    fs = require('fs'),
    path = require('path');

var tmpdir = 'tmp';

function rmdirs(dir, cb){
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
                    rmdirs(file, rmFile);
                } else {
                    fs.unlink(file, rmFile);
                }
            });
        };

        rmFile();
    });
}


exports['consolidatecss'] = {
    tearDown: function(done) {
        path.exists(tmpdir, function(exists) {
            if (exists) {
                rmdirs(tmpdir, done);
            } else {
                fs.mkdirSync(tmpdir);
                done();
            }
        });
    },

    consolidateSimple: function(test) {
        test.expect(1);
        var files = ['test/fixtures/test.html'];

        var dest = 'tmp/simple';

        grunt.helper('consolidatecss', files, dest, null, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');

            test.equal(
                    grunt.file.read(outCss),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.done();
        });
    },

    consolidateNoMin: function(test) {
        test.expect(1);
        var files = ['test/fixtures/test.html'];

        var dest = 'tmp/nomin';

        grunt.helper('consolidatecss', files, dest, { min: false }, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');

            test.equal(
                    grunt.file.read(outCss),
                    '#test {\r\n    color:red;\r\n}\r\n\r\nbody {\r\n    font-size: 20px;\r\n}\r\n\r\ndiv {\r\n    font-weight:bold;\r\n}\r\n');

            test.done();
        });
    }
};
