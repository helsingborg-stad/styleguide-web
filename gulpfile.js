// Include gulp
var gulp = require('gulp');

// Include Our Plugins
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');

var dss = require('gulp-docs');
//var mustache = require("gulp-mustache");

// Compile Our Sass
gulp.task('sass-dist', function() {
    return gulp.src('source/sass/hbg-prime.scss')
            .pipe(plumber())
            .pipe(sass())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({suffix: '.min'}))
            .pipe(minifycss())
            .pipe(gulp.dest('dist/css'));
});

gulp.task('sass-dev', function() {
    return gulp.src('source/sass/hbg-prime.scss')
            .pipe(plumber())
            .pipe(sass())
            .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1'))
            .pipe(rename({suffix: '.dev'}))
            .pipe(gulp.dest('dist/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src([
                'source/js/**/*.js',
            ])
            .pipe(concat('modularity.dev.js'))
            .pipe(gulp.dest('dist/js'))
            .pipe(rename('modularity.min.js'))
            .pipe(uglify())
            .pipe(gulp.dest('dist/js'));
});

// Documented Style Sheets
gulp.task('dss', function() {
    return gulp.src([
            'source/sass/**/*.scss',
            '!source/sass/config/*.scss',
            '!source/sass/hbg-prime.scss'
        ])
        .pipe(dss({
            fileName: "documentation",
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
    gulp.watch('source/sass/**/*.scss', ['sass-dist', 'sass-dev', 'dss']);
    gulp.watch('templates/*.mustache', ['dss']);
});

// Default Task
gulp.task('default', ['sass-dist', 'sass-dev', 'scripts', 'dss', 'watch']);

