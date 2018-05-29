var gulp = require('gulp');

var package = require('../package.json');

var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var copy = require('gulp-copy');
var sourcemaps = require('gulp-sourcemaps');

var node_modules = 'node_modules/';

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
                node_modules + 'packery/dist/packery.pkgd.js',
                node_modules + 'jquery/dist/jquery.js',
                'plugins/jquery-ui-1.11.4/jquery-ui.js',
                node_modules + 'es6-weakmap/dist/weakmap.min.js',
                node_modules + 'hyperform/dist/hyperform.js',
                node_modules + 'flickity/dist/flickity.pkgd.min.js',
                'source/js/**/*.js'
            ])
            .pipe(sourcemaps.init())
            .pipe(concat('hbg-prime.dev.js'))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist/js'))
            .pipe(copy('dist/' + package.version + '/js/', {prefix: 2}))
            .pipe(rename('hbg-prime.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'))
            .pipe(copy('dist/' + package.version + '/js/', {prefix: 2}));
});
