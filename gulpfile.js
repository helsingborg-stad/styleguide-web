// ==========================================================================
//
// TASKS:
//
// "gulp"                       -   Build and watch combined
// "gulp watch"                 -   Watch for file changes and compile changed files
// "gulp build"                 -   Build assets
// "gulp icons"                 -   Build icons
// "gulp patch/minor/major"     -   Bump package version
//
// ==========================================================================

var gulp = require('gulp');

var runSequence = require('run-sequence');
var bump = require('gulp-bump');
var git = require('gulp-git');
var filter = require('gulp-filter');
var tag_version = require('gulp-tag-version');

gulp.task('default', function (callback) {
    return runSequence('instructions', 'build', 'watch', callback);
});

gulp.task('build', function (callback) {
    return runSequence('sass-font-awesome', 'build:sass', 'build:scripts', callback);
});

gulp.task('build:sass', function (callback) {
    return runSequence('sass-dev', 'sass-dist', 'sass-json', 'dss-sass', callback);
});

gulp.task('build:scripts', function (callback) {
    return runSequence('scripts', 'dss-scripts', callback);
});

gulp.task('icons', function (callback) {
    return runSequence('iconfont', 'build:sass', callback);
});

gulp.task('watch', function() {
    gulp.watch('source/js/**/*.js', ['build:scripts']);
    gulp.watch('source/sass/**/*.scss', ['build:sass']);
});

gulp.task('instructions', function() {
    console.log("NOTICE: Always run 'gulp patch, gulp minor, gulp major' to bump versions in styleguide!");
});

function inc(importance) {
    return gulp.src(['./package.json'])
        .pipe(bump({type: importance}))
        .pipe(gulp.dest('./'))
        .pipe(git.commit('Bumps package version'))
        .pipe(filter('package.json'))
        .pipe(tag_version());
}

gulp.task('patch', function() { return inc('patch'); })
gulp.task('minor', function() { return inc('minor'); })
gulp.task('major', function() { return inc('major'); })


gulp.task('bem', function (callback) {
    return runSequence('build:bem', 'watch:bem', callback);
});

require('require-dir')('./gulp');
