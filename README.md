# grunt-consolidate-css

Consolidates and minifies your CSS files on a per-page basis

## Getting Started

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

## Documentation

### Setting up

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

### Basic output

Your files will be modified from something like this:

    <link rel="stylesheet" type="text/css" href="file2.css">
    <link rel="stylesheet" type="text/css" href="file1.css">
    <link rel="stylesheet" type="text/css" href="subdir/file2.css">

into something like this:

    <link rel="stylesheet" type="text/css" href="css.min/file1,file2,subdir$file2.min.css">

with all the files consolidated and minified using YUICompressor.

### Grouping files

If you want to group CSS files together into separate outputs, just leave a blank
line between the `<link>` tags, e.g.

    <link rel="stylesheet" type="text/css" href="file2.css">
    <link rel="stylesheet" type="text/css" href="file1.css">

    <link rel="stylesheet" type="text/css" href="subdir/file2.css">
    <link rel="stylesheet" type="text/css" href="subdir/file3.css">

will become

    <link rel="stylesheet" type="text/css" href="css.min/file1,file2.min.css">
    <link rel="stylesheet" type="text/css" href="css.min/subdir$file2,subdir$file3.min.css">

### Cross-page validation

The plugin is slightly strict about how you treat your CSS files, which seems like
an acceptable trade-off against not needing to configure your consolidation at all.

It will detect link tags on different pages that contain the same CSS files, but in a
different order and fail your build until you fix it. This ensures that the same group of
CSS files produces the same output, cached across pages in the browser.

Why not just reorder them automatically? Because order in CSS can often matter, and it's
better to avoid the possibility of a tool automatically generating a hard-to-debug
layout problem altogether by forcing you to decide on the order explicitely.

## Options
- `min` Toggles minification of the CSS. It's true by default and if off, then the files will only be concatenated.
- `yuijarpath` YUICompressor 2.4.7 comes build-in, but pass the path to a jar of your own here to override it.
- `cssdir` The subdirectory that sits alongside the processed HTML that will hold the CSS. By default this will either be `css` or `css.min`.
- `pathPrefix` This is a prefix added to all CSS link URLs, e.g. a domain name. Sometimes it's useful to use absolute URLs on your test environment.

## Release History
0.0.1 - Initial attempt

## License
Copyright (c) 2012 Ian Beveridge
Licensed under the MIT license.
