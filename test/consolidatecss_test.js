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
                done();//rmdirs(tmpdir, done);
            } else {
                fs.mkdirSync(tmpdir);
                done();
            }
        });
    },

    testSimple: function(test) {

        test.expect(2);

        var files = ['test/fixtures/test.html'];

        var dest = 'tmp/simple';

        grunt.helper('consolidatecss', files, dest, null, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');

            test.equal(
                    grunt.file.read(path.join(dest, 'css.min/file2,file1,subdir$file2.min.css')),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, '/test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="css.min/file2,file1,subdir$file2.min.css">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    },

    testPathPrefix: function(test) {

        test.expect(2);

        var files = ['test/fixtures/test.html'];

        var dest = 'tmp/simple';

        grunt.helper('consolidatecss', files, dest, {pathPrefix: "http://example.com/subdir"}, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');

            test.equal(
                    grunt.file.read(path.join(dest, 'css.min/file2,file1,subdir$file2.min.css')),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, '/test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="http://example.com/subdir/css.min/file2,file1,subdir$file2.min.css">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    },

    testNoMin: function(test) {

        test.expect(2);

        var files = ['test/fixtures/test.html'];

        var dest = 'tmp/nomin';

        grunt.helper('consolidatecss', files, dest, { min: false }, function() {

            test.equal(
                    grunt.file.read(path.join(dest, 'css/file2,file1,subdir$file2.min.css')),
                    '#test {\r\n    color:red;\r\n}\r\n\r\nbody {\r\n    font-size: 20px;\r\n}\r\n\r\ndiv {\r\n    font-weight:bold;\r\n}\r\n');

            test.equal(
                    grunt.file.read(path.join(dest, '/test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="css/file2,file1,subdir$file2.min.css">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    },

    testGroups: function(test) {

        test.expect(3);

        var files = ['test/fixtures/grouped.html'];

        var dest = 'tmp/grouped';

        grunt.helper('consolidatecss', files, dest, null, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');

            test.equal(
                    grunt.file.read(path.join(dest, 'css.min/file2,file1.min.css')),
                    '#test{color:red}body{font-size:20px}');

            test.equal(
                    grunt.file.read(path.join(dest, 'css.min/subdir$file2,subdir$file3.min.css')),
                    'div{font-weight:bold}.fineprint{font-size:5px}');

            test.equal(
                    grunt.file.read(path.join(dest, '/grouped.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="css.min/file2,file1.min.css">\n\n    <link rel="stylesheet" type="text/css" href="css.min/subdir$file2,subdir$file3.min.css">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    },

    testOrderMismatch: function(test) {

        test.expect(1);

        var files = ['test/fixtures/test.html', 'test/fixtures/test-alt.html'];

        var dest = 'tmp/order-mismatch';

        grunt.helper('consolidatecss', files, dest, {_neverfail:true}, function(err) {
            test.equal(
                    err,
                    'Pages ref same CSS in different orders 1) test/fixtures/test.html 2) test/fixtures/test-alt.html');
            test.done();
        });
    }

};
