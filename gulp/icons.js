var gulp = require('gulp');

var copy = require('gulp-copy');

var svgscaler = require('svg-scaler');
var svgo = require('gulp-svgo');
var svgSprite = require('gulp-svg-sprite');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');

var package = require('../package.json');

// Svg sprites
gulp.task('iconsprite', function () {
    return gulp.src('source/icons/**/*.svg')
        .pipe(svgSprite({
            mode: {
                symbol: {
                    dest: '',
                    prefix: 'icon-%s',
                    bust: false,
                    sprite: 'dist/images/icons.svg'
                }
            }
        }))
        .pipe(gulp.dest(''));
});

// Iconfont
gulp.task('icons-scale', function () {
    return gulp.src('source/icons/**/*.svg')
        .pipe(svgo())
        .pipe(svgscaler({ width: 1000 }))
        .pipe(gulp.dest('source/icons/'))
});

gulp.task('iconfont', ['icons-scale'], function () {
    return gulp.src('source/icons/**/*.svg')
        .pipe(iconfont({
            fontName: 'hbg-pricons',
            prependUnicode: true,
            formats: ['eot', 'svg', 'ttf', 'woff', 'woff2', 'otf'],
            normalize: true,
            ascent: 0
        }))
        .on('glyphs', function (glyph, options) {
            gulp.src('source/icons/_pricons.scss')
              .pipe(consolidate('lodash', {
                glyphs: glyph,
                fontName: 'hbg-pricons',
                fontPath: '../fonts/',
                className: 'pricon'
              }))
              .pipe(gulp.dest('source/sass/'))
              .pipe(copy('dist/' + package.version + '/fonts/', {prefix: 2}));

            gulp.src('source/icons/pricons.json')
              .pipe(consolidate('lodash', {
                glyphs: glyph,
                fontName: 'hbg-pricons',
                fontPath: '../fonts/',
                className: 'pricon'
              }))
              .pipe(gulp.dest('dist/'))
        })
        .pipe(gulp.dest('dist/fonts/'))
        .pipe(copy('dist/' + package.version + '/fonts/', {prefix: 2}));
});
