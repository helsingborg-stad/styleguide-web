var gulp = require('gulp');

var dss = require('gulp-docs');

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

gulp.task('dss-scripts', function() {
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
