// Include gulp
var gulp = require('gulp');

//Package info
var package = require('./package.json');

// Include Our Plugins
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var dss = require('gulp-docs');
var git = require('git-rev');
var copy = require('gulp-copy');
var git = require('gulp-git');
var bump = require('gulp-bump');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

// Icon plugins
var svgscaler = require('svg-scaler');
var svgo = require('gulp-svgo');
var svgSprite = require('gulp-svg-sprite');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');

var node_modules = 'node_modules/';

//Version number
function inc(importance) {
    return gulp.src(['./package.json'])
        .pipe(bump({type: importance}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('Bumps package version'))
        .pipe(filter('package.json'))
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('feature', function() { return inc('minor'); })
gulp.task('release', function() { return inc('major'); })

// Compile Our Sass
gulp.task('sass-dist', function() {
    return gulp.src('source/sass/themes/*.scss')
            .pipe(sass())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({prefix: 'hbg-prime-', suffix: '.min'}))
            .pipe(cssnano({
                mergeLonghand: false,
                zindex: false,
                discardComments: true,
                colormin: true,
                core: true,
                discardEmpty: true,
                discardOverridden: true,
                filterOptimiser: true,
                functionOptimiser: true,
                mergeRules: true,
                minifyFontValues: true,
                minifyGradients: true,
                minifyParams: true,
                minifySelectors: true,
                normalizeCharset: true,
                normalizeUrl: true,
                orderedValues: true,
                reduceBackgroundRepeat: true,
                reduceIdents: false,
                reducePositions: true,
                reduceTimingFunctions: true,
                reduceTransforms: true,
                svgo: true,
                uniqueSelectors: true
            }))
            .pipe(gulp.dest('dist/css'))
            .pipe(copy('dist/' + package.version + '/css/', {prefix: 2}));
});

gulp.task('sass-dev', function() {
    return gulp.src('source/sass/themes/*.scss')
            .pipe(sass({ sourceComments: true }))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({prefix: 'hbg-prime-', suffix: '.dev'}))
            .pipe(gulp.dest('dist/css'));
});

gulp.task('sass-font-awesome', function () {
    gulp.src(node_modules + 'font-awesome/css/font-awesome.min.css')
        .pipe(gulp.dest('source/sass'));

    gulp.src(node_modules + 'font-awesome/fonts/*')
        .pipe(gulp.dest('dist/fonts/'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
                node_modules + 'jquery/dist/jquery.js',
                'plugins/jquery-ui-1.11.4/jquery-ui.js',
                 node_modules + 'hyperform/dist/hyperform.js',
                'source/js/**/*.js'
            ])
            .pipe(concat('hbg-prime.dev.js'))
            .pipe(gulp.dest('dist/js'))
            .pipe(rename('hbg-prime.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'))
            .pipe(copy('dist/' + package.version + '/js/', {prefix: 2}));
});

// Documented Style Sheets
gulp.task('dss-sass', function() {
    return gulp.src([
            'source/sass/**/*.scss',
            '!source/sass/themes/*.scss',
            '!source/sass/config/*.scss',
            '!source/sass/_bootstrap.scss'
        ])
        .pipe(dss({
            fileName: "documentation-sass",
            parsers: {
                // @state :hover - When the button is hovered over.
                state: function(i, line, block, file, endOfBlock) {
                    var values = line.split(' - '),
                    states = (values[0]) ? (values[0].replace(":::", ":").replace("::", ":")) : "";

                    return {
                        name: states,
                        escaped: states.replace(":", " :").replace(".", " ").trim(),
                        description: (values[1]) ? values[1].trim() : ""
                    };
                }
            }
        }))
        .pipe(gulp.dest(''));
});

// Svg sprites
gulp.task('iconsprite', function () {
    gulp.src('source/icons/**/*.svg')
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

// CSS & JS versioning
gulp.task('versioning', function () {
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
        })
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('icons', function () {
    runSequence('iconfont', ['sass-dist', 'sass-dev', 'dss-sass']);
});

// Documented JS
gulp.task('dss-js', function() {
    return gulp.src([
            'source/js/**/*.js',
            '!source/js/app.js',
        ])
        .pipe(dss({
            fileName: "documentation-js",
            parsers: {
                // @state :hover - When the button is hovered over.
                state: function(i, line, block, file, endOfBlock) {
                    var values = line.split(' - '),
                    states = (values[0]) ? (values[0].replace(":::", ":").replace("::", ":")) : "";

                    return {
                        name: states,
                        escaped: states.replace(":", " :").replace(".", " ").trim(),
                        description: (values[1]) ? values[1].trim() : ""
                    };
                }
            }
        }))
        .pipe(gulp.dest(''));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('source/js/**/*.js', ['scripts']);
    gulp.watch('source/sass/**/*.scss', ['sass-dist', 'sass-dev']);
});

// Istructions
gulp.task('instructions', function() {
    console.log("NOTICE: Always run 'gulp patch, gulp minor, gulp major' to bump versions in styleguide!");
});

// Default Task
gulp.task('default', ['instructions','sass-font-awesome', 'sass-dev', 'sass-dist', 'scripts', 'dss-sass', 'dss-js', 'watch']);

