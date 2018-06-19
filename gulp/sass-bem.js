var gulp = require('gulp');
var package = require('../package.json');

var autoprefixer = require('gulp-autoprefixer');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var cleanCSS = require('gulp-clean-css');
var copy = require('gulp-copy');
var browserSync = require('browser-sync').create();
var sassJson = require('gulp-sass-json');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');

var inject = require('gulp-inject');

var node_modules = 'node_modules/';

gulp.task('build:bem', function (callback) {
    return runSequence('inject:bem', 'build:sass:bem', callback);
});

gulp.task('build:sass:bem', function (callback) {
    return runSequence('sass-dev:bem', 'sass-dist:bem', callback);
});

gulp.task('watch:bem', function() {
    gulp.watch('source/sass-bem/**/*.scss', ['build:sass:bem']);
    gulp.watch('source/sass/**/*.scss', ['build:sass:bem']);
});

gulp.task('sass-dist:bem', function() {
    return gulp.src('source/sass-bem/_themes/*.scss')
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({prefix: 'hbg-prime-', suffix: '.min'}))
            .pipe(cleanCSS({debug: true}))
            .pipe(gulp.dest('dist/css-bem'))
            .pipe(copy('dist/' + package.version + '/css-bem/', {prefix: 2}))
            .pipe(browserSync.stream());
});

gulp.task('sass-dev:bem', function() {
    return gulp.src('source/sass-bem/_themes/*.scss')
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(sass({ sourceComments: true }).on('error', sass.logError))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({prefix: 'hbg-prime-', suffix: '.dev'}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist/css-bem'))
            .pipe(copy('dist/' + package.version + '/css-bem/', {prefix: 2}))
            .pipe(browserSync.stream());
});

gulp.task('inject:bem', function(callback) {
    return runSequence('inject:tools', 'inject:generic', 'inject:elements', 'inject:objects', 'inject:components', 'inject:scope', 'inject:utilities', callback);
});

function injectConfig(layer) {
    return {
        starttag: '// inject:' + layer,
        endtag: '// endinject',
        transform: function (filepath) {return '@import ".' + filepath + '";';}
    };
}

gulp.task('inject:tools', function() {
    var layer = 'tools';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src(['./source/sass/' + layer + '/**/*.scss', './source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});

gulp.task('inject:generic', function() {
    var layer = 'generic';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src(['./source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});

gulp.task('inject:elements', function() {
    var layer = 'elements';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src(['./source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});

gulp.task('inject:objects', function() {
    var layer = 'objects';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src(['./source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});

gulp.task('inject:components', function() {
    var layer = 'components';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src([node_modules + 'hamburgers/_sass/hamburgers/hamburgers.scss', './source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});

gulp.task('inject:scope', function() {
    var layer = 'scope';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src(['./source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});


gulp.task('inject:utilities', function() {
    var layer = 'utilities';
    var config = injectConfig(layer);

    return gulp.src('./source/sass-bem/_bootstrap.scss')
        .pipe(inject(gulp.src(['./source/sass-bem/' + layer + '/**/*.scss'], {read: false}, {relative: false}), config))
        .pipe(gulp.dest('./source/sass-bem'));
});
