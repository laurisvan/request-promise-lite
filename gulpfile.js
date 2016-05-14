const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const jsonlint = require('gulp-jsonlint');
const jshint = require('gulp-jshint');
const jscs = require('gulp-jscs');
const gMocha = require('gulp-mocha');
const gSequence = require('gulp-sequence');

gulp.task('jsonlint', function () {
  return gulp.src(['**/*.json', '!**/node_modules/**/*.json', '!www/**/*.json', '!_meta/**/*.json'])
    .pipe(jsonlint())
    .pipe(jsonlint.reporter())
    .pipe(jsonlint.failOnError());
});

gulp.task('jshint', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
    .pipe(jscs())
    .pipe(jscs.reporter())
    .pipe(jscs.reporter('fail'));
});

gulp.task('mocha', function () {
  return gulp.src('test/test.js', { read: false, timeout: 5000 })
    .pipe(gMocha());
});

gulp.task('watch', function() {
  gulp.watch(['src/**/*.js'], ['default']);
});

gulp.task('default', function () {
  function reportError(error) {
    // If you want details of the error in the console
    console.warn(error.toString());
    console.warn(error.message);
    // jshint validthis: true
    this.emit('end');
  }

  // TODO We should merge these two streams
  gulp.src(['src/**/*.json'])
    .pipe(gulp.dest('lib'));

  return gulp.src([ 'src/**/*.js' ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015'],
      plugins: [/*'transform-runtime', */'add-module-exports']
    }))
    .on('error', reportError)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

// Aliases
gulp.task('validate', ['jsonlint', 'jshint', 'jscs']);
gulp.task('test', gSequence('validate', 'mocha'));
gulp.task('build', ['default']);