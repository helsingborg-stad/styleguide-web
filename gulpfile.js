// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var dss = require('gulp-docs');

var node_modules = 'node_modules/';

// Compile Our Sass
gulp.task('sass-dist', function() {
    return gulp.src('source/sass/hbg-prime.scss')
            .pipe(sass())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({suffix: '.min'}))
            .pipe(cssnano({
                mergeLonghand: false,
                zindex: false
            }))
            .pipe(gulp.dest('dist/css'));
});

gulp.task('sass-dev', function() {
    return gulp.src('source/sass/hbg-prime.scss')
            .pipe(sass({ sourceComments: true }))
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({suffix: '.dev'}))
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
                'source/js/**/*.js'
            ])
            .pipe(concat('hbg-prime.dev.js'))
            .pipe(gulp.dest('dist/js'))
            .pipe(rename('hbg-prime.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'));
});

// Documented Style Sheets
gulp.task('dss-sass', function() {
    return gulp.src([
            'source/sass/**/*.scss',
            '!source/sass/config/*.scss',
            '!source/sass/hbg-prime.scss'
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

// Default Task
gulp.task('default', ['sass-font-awesome', 'sass-dev', 'sass-dist', 'scripts', 'dss-sass', 'dss-js', 'watch']);

