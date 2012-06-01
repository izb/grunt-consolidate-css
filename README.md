# grunt-consolidate-css

Consolidates and minifies your CSS files on a per-page basis

## Getting Started

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation
Modify your `grunt.js` file by adding the following line:

    grunt.loadNpmTasks('grunt-consolidate-css');

Then add some configuration for the plugin like so:

    grunt.initConfig({
        ...
        consolidateCss: {
          app: {
            src: ['path/to/html/files/*.html', 'path/to/html/files/*.php'],
            options: {
                min: true
            }
          }
        },
        ...
    });

Then just run `grunt consolidateCss`.

Your files will be modified from something like this:

    <link rel="stylesheet" type="text/css" href="file2.css">
    <link rel="stylesheet" type="text/css" href="file1.css">
    <link rel="stylesheet" type="text/css" href="subdir/file2.css">

into something like this:

    <link rel="stylesheet" type="text/css" href="file1,file2,subdir$file2.min.css">

with all the files consolidated and minified using YUICompressor.

## Options
- 'min': Toggles minification of the CSS. It's true by default and if off, then the files will only be concatenated.
- 'yuijarpath': YUICompressor 2.4.7 comes build-in, but pass a jar of your own here to override it.

## Release History
0.0.1 - Initial attempt

## License
Copyright (c) 2012 Ian Beveridge
Licensed under the MIT license.
