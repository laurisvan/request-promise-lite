const coveralls = require('gulp-coveralls');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const istanbul = require('gulp-istanbul');
const mocha = require('gulp-mocha');
const sequence = require('gulp-sequence');
const util = require('gulp-util');

gulp.task('eslint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('mocha', () => {
  return gulp.src('lib/**/*.js')
    .pipe(istanbul())
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      return gulp.src('test/test.js', { read: false })
        .pipe(mocha())
        .pipe(istanbul.writeReports())
        .pipe(istanbul.enforceThresholds({
          thresholds: {
            statements: 95,
            branches: 75,
            lines: 95,
          },
        }))
        .on('error', util.log);
    });
});

gulp.task('coveralls', () => {
  return gulp.src('coverage/**/lcov.info')
    .pipe(coveralls());
});

gulp.task('watch', () => {
  return gulp.watch(['src/**/*.js'], ['default']);
});

// Aliases
gulp.task('validate', ['eslint']);
gulp.task('test', sequence('validate', 'mocha'));
