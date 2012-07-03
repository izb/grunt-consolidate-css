# grunt-consolidate-css

Consolidates and minifies your CSS/SCSS/SASS files on a per-page basis

## Getting Started, Getting Help
- [Grunt repo](https://github.com/cowboy/grunt)
- [Getting started with grunt](https://github.com/cowboy/grunt/blob/master/docs/getting_started.md)
- [Twitter](http://twitter.com/izb)

## Documentation

### Setting up

Install grunt (If you haven't already) and this plugin with

    $ npm install grunt
    $ npm install grunt-consolidate-css

If you want to minify your CSS, you'll need `java` on your PATH.

If you want to use SASS/SCSS stylesheets, you'll also need the `scss` converter on your PATH.

### Adding to your build process

Modify your `grunt.js` file by adding the following line:

    grunt.loadNpmTasks('grunt-consolidate-css');

Then add some configuration for the plugin like so:

    grunt.initConfig({
        ...
        consolidatecss: {
          app: {
            src: ['path/to/html/files/*.html', 'path/to/html/files/*.php'],
            options: {
                cssdir: 'stylesheets'
            }
          }
        },
        ...
    });

Then just run `grunt consolidatecss`.

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

### SCSS/SASS

You can mix CSS and SCSS/SASS files together in the same groups. The plugin will work out what's what
from the file extension and will convert the files transparently.

    <link rel="stylesheet" type="text/sass" href="file1.sass">
    <link rel="stylesheet" type="text/scss" href="file2.scss">
    <link rel="stylesheet" type="text/css" href="file3.css">

will become

    <link rel="stylesheet" type="text/css" href="file1,file2,file3.min.css">

All output as one consolidated, minified, pure CSS file.

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
- `min` Toggles minification of the CSS. It's true by default. If false, then the files will only be concatenated.
- `yuijarpath` YUICompressor 2.4.7 comes build-in, but pass the path to a jar of your own here to override it.
- `cssdir` The subdirectory that sits alongside the processed HTML that will hold the CSS. By default this will either be `css` or `css.min`.
- `pathPrefix` This is a prefix added to all CSS link URLs, e.g. a domain name. Sometimes it's useful to use absolute URLs on your test environment.
- `intermediates` By default, the plugin cleans up after itself, deleting all intermediate stages of CSS that are not the final result. Set this to false to keep the unminified and unconsolidated forms of your CSS.
- `basedir` *Required* The root of your input directories. Used to calculate where the output CSS should be placed.
- `dest` *Required* Where the processed HTML and CSS should go. Pages will keep their folder structure, CSS will be placed into `cssdir`.

## Release History
- 0.4.2 - First version proven in the field. First version that feels stable.
- 0.2.1 - First version with SCSS/SASS support
- 0.1.2 - First working version.
