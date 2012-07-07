var grunt = require('grunt'),
    fs = require('fs'),
    path = require('path');

var tmpdir = 'tmp';

function rmdirs(dir, cb){
    fs.exists(dir, function(exists) {
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
                            rmdirs(file, rmFile);
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
}

exports['consolidatecss_simple'] = {

    setUp: function(done) {
        var dest = path.join(tmpdir, 'simple');
        rmdirs(dest, done);
    },

    testSimple: function(test) {

        test.expect(2);

        var dest = path.join(tmpdir, 'simple');

        var files = ['test.html'];

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures',intermediates:false, dest:dest}, function() {

            var cssname = 'css.min/file2,file1,subdir$file2.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, '/test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_sass'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'sass-scss');
        rmdirs(dest, done);
    },

    testSASSSCSS: function(test) {

        test.expect(2);

        var files = ['test-sass-scss.html'];

        var dest = path.join(tmpdir, 'sass-scss');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', intermediates:false, dest:dest}, function() {

            var cssname = 'css.min/file1,file2,file3.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    'body{font-size:20px}h1{height:34px;line-height:19px}#navbar{width:80%;height:23px}#navbar ul{list-style-type:none}#navbar li{float:left}#navbar li a{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, '/test-sass-scss.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_path_prefix'] = {
    setUp: function(done) {
        grunt.log.writeln("Test: Path prefix");
        var dest = path.join(tmpdir, 'path-prefix');
        rmdirs(dest, done);
    },

    testPathPrefix: function(test) {

        test.expect(2);

        var files = ['test.html'];

        var dest = path.join(tmpdir, 'path-prefix');

        grunt.helper('consolidatecss', files, {pathPrefix: "http://example.com/subdir", basedir:'test/fixtures', dest:dest}, function() {

            var cssname = 'css.min/file2,file1,subdir$file2.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, '/test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="http://example.com/subdir/'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_nomin'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'nomin');
        rmdirs(dest, done);
    },

    testNoMin: function(test) {

        test.expect(2);

        var files = ['test.html'];

        var dest = path.join(tmpdir, 'nomin');

        grunt.helper('consolidatecss', files, { min: false, basedir:'test/fixtures', dest:dest }, function() {

            var cssname = 'css/file2,file1,subdir$file2.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    '#test {\r\n    color:red;\r\n}\r\n\r\nbody {\r\n    font-size: 20px;\r\n}\r\n\r\ndiv {\r\n    font-weight:bold;\r\n}\r\n');

            test.equal(
                    grunt.file.read(path.join(dest, '/test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_grouped'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'grouped');
        rmdirs(dest, done);
    },

    testGroups: function(test) {

        test.expect(3);

        var files = ['grouped.html'];

        var dest = path.join(tmpdir, 'grouped');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', dest:dest}, function() {
            var outCss = path.join(dest, '/file2,file1,subdir$file2.min.css');

            var cssname1 = 'css.min/file2,file1.min.css';
            var cssname2 = 'css.min/subdir$file2,subdir$file3.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname1)),
                    '#test{color:red}body{font-size:20px}');

            test.equal(
                    grunt.file.read(path.join(dest, cssname2)),
                    'div{font-weight:bold}.fineprint{font-size:5px}');

            test.equal(
                    grunt.file.read(path.join(dest, '/grouped.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname1+'">\n\n    <link rel="stylesheet" type="text/css" href="'+cssname2+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_order_mismatch'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'order-mismatch');
        rmdirs(dest, done);
    },

    testOrderMismatch: function(test) {

        test.expect(1);

        var files = ['test.html', 'test-alt.html'];

        var dest = path.join(tmpdir, 'order-mismatch');

        grunt.helper('consolidatecss', files, {_neverfail:true, basedir:'test/fixtures', dest:dest}, function(err) {
            test.equal(
                    err,
                    'Pages ref same CSS in different orders 1) test/fixtures/test.html 2) test/fixtures/test-alt.html');
            test.done();
        });
    }
};

exports['consolidatecss_one_css'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'one-css');
        rmdirs(dest, done);
    },

    testOneCSSFile: function(test) {

        test.expect(2);

        var files = ['test-one-css.html'];

        var dest = path.join(tmpdir, 'one-css');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', dest:dest}, function() {

            var cssname = 'css.min/file1.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    'body{font-size:20px}');

            test.equal(
                    grunt.file.read(path.join(dest, '/test-one-css.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_siblingdir'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'sibling-dir');
        rmdirs(dest, done);
    },

    testSiblingDir: function(test) {

        test.expect(2);

        var files = ['pages/sibling.html'];

        var dest = path.join(tmpdir, 'sibling-dir');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', dest:dest}, function() {

            var cssname = 'css.min/subdir$file2,file2,file1,subdir$file3.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    'div{font-weight:bold}#test{color:red}body{font-size:20px}.fineprint{font-size:5px}');

            test.equal(
                    grunt.file.read(path.join(dest, '/pages/sibling.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="../'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_nosubdirs'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'no-subdirs');
        rmdirs(dest, done);
    },

    testNoSubdirs: function(test) {

        test.expect(2);

        var files = ['test-no-subdirs.html'];

        var dest = path.join(tmpdir, 'no-subdirs');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', dest:dest}, function() {

            var cssname = 'css.min/file1,file2.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    'body{font-size:20px}h1{height:34px;line-height:19px}');

            test.equal(
                    grunt.file.read(path.join(dest, 'test-no-subdirs.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_customcssdir'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'custom-css-dir');
        rmdirs(dest, done);
    },

    testCustomCSSDir: function(test) {

        test.expect(2);

        var files = ['test.html'];

        var dest = path.join(tmpdir, 'custom-css-dir');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', cssdir:'styles', dest:dest}, function() {

            var cssname = 'styles/file2,file1,subdir$file2.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, 'test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_emptycssdir'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'empty-css-dir');
        rmdirs(dest, done);
    },

    testEmptyCSSDir: function(test) {

        test.expect(2);

        var files = ['test.html'];

        var dest = path.join(tmpdir, 'empty-css-dir');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', cssdir:'', dest:dest}, function() {

            var cssname = 'file2,file1,subdir$file2.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    '#test{color:red}body{font-size:20px}div{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, 'test.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

exports['consolidatecss_sassimport'] = {
    setUp: function(done) {
        var dest = path.join(tmpdir, 'sassimport');
        rmdirs(dest, done);
    },

    testSASSImport: function(test) {

        test.expect(2);

        var files = ['test-sass-import.html'];

        var dest = path.join(tmpdir, 'sassimport');

        grunt.helper('consolidatecss', files, {basedir:'test/fixtures', cssdir:'', dest:dest }, function() {

            var cssname = 'subdir$file4.min.css';

            test.equal(
                    grunt.file.read(path.join(dest, cssname)),
                    '#navbar{width:80%;height:23px;background-color:#78b}#navbar ul{list-style-type:none}#navbar li{float:left}#navbar li a{font-weight:bold}');

            test.equal(
                    grunt.file.read(path.join(dest, 'test-sass-import.html')),
                    '<!doctype html>\n\n    <link rel="stylesheet" type="text/css" href="'+cssname+'">\n\n<div id="test">Hello, world</div>\n');

            test.done();
        });
    }
};

/*

TODO: Missing unit tests

- HTML in different levels with same CSS groups (Above, below)
- Test ALL the fail()s

*/
