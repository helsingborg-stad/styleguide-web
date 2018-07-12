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

var node_modules = 'node_modules/';

gulp.task('sass-dist', function() {
    return gulp.src('source/sass/themes/*.scss')
            .pipe(plumber())
            .pipe(sass().on('error', sass.logError))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({prefix: 'hbg-prime-', suffix: '.min'}))
            .pipe(cleanCSS({debug: true}))
            .pipe(gulp.dest('dist/css'))
            .pipe(copy('dist/' + package.version + '/css/', {prefix: 2}))
            .pipe(browserSync.stream());
});

gulp.task('sass-dev', function() {
    return gulp.src('source/sass/themes/*.scss')
            .pipe(plumber())
            .pipe(sourcemaps.init())
            .pipe(sass({ sourceComments: true }).on('error', sass.logError))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({prefix: 'hbg-prime-', suffix: '.dev'}))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest('dist/css'))
            .pipe(copy('dist/' + package.version + '/css/', {prefix: 2}))
            .pipe(browserSync.stream());
});

gulp.task('sass-json', function () {
    return gulp.src('source/sass/themes/*.scss')
        .pipe(sassJson())
        .pipe(gulp.dest('dist/vars'));
});

gulp.task('sass-font-awesome', function () {
    gulp.src(node_modules + 'font-awesome/css/font-awesome.min.css')
        .pipe(gulp.dest('source/sass'));

    gulp.src(node_modules + 'font-awesome/fonts/*')
        .pipe(gulp.dest('dist/fonts/'))
        .pipe(copy('dist/' + package.version + '/fonts/', {prefix: 2}));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        proxy: "hbgprime.local"
    });
});

gulp.task('watch-live', ['browser-sync'], function () {
    gulp.watch('source/js/**/*.js', ['build:scripts', browserSync.reload]);
    gulp.watch('source/sass/**/*.scss', ['build:sass']);
});
