var gulp = require('gulp')
  , concat = require("gulp-concat")
  , browserify = require('browserify')
  , uglify = require('gulp-uglify')
  , source = require('vinyl-source-stream')
  , mochaPhantomJS = require('gulp-mocha-phantomjs')
  , deploy = require('gulp-gh-pages');


gulp.task('browserify', function() {
  return browserify('./index-browserify.js')
    .bundle()
    .pipe(source('drag-mock.js'))
    .pipe(gulp.dest('dist/'));
});


gulp.task('uglify', ['browserify'], function() {
  return gulp.src('dist/drag-mock.js')
    .pipe(uglify())
    .pipe(concat('drag-mock.min.js'))
    .pipe(gulp.dest('dist/'));
});


gulp.task('test', function() {
  return gulp
    .src('test/runner.html')
    .pipe(mochaPhantomJS({
      webSecurityEnabled: false,
      outputEncoding: 'utf8'
    }));
});


gulp.task('deploy', ['dist', 'test'], function() {
  return gulp.src('./dist/**/*')
    .pipe(deploy());
});


gulp.task('dist', ['browserify', 'uglify']);

gulp.task('default', ['dist', 'test']);
