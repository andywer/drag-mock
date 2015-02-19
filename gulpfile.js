var gulp = require('gulp')
  , concat = require("gulp-concat")
  , browserify = require('browserify')
  , uglify = require('gulp-uglify')
  , source = require('vinyl-source-stream')
  , mocha = require('gulp-mocha')
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


gulp.task('test-browser', function() {
  return gulp
    .src('test/browser/runner.html')
    .pipe(mochaPhantomJS({
      webSecurityEnabled: false,
      outputEncoding: 'utf8'
    }));
});

gulp.task('test-node', function() {
  return gulp
    .src('test/node/spec/*.spec.js', { read: false })
    .pipe(mocha());
});


gulp.task('test', ['test-browser', 'test-node']);

gulp.task('deploy', ['dist', 'test'], function() {
  return gulp.src('./dist/**/*')
    .pipe(deploy());
});


gulp.task('dist', ['browserify', 'uglify']);

gulp.task('default', ['dist', 'test']);
