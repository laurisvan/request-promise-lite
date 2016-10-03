const babel = require('gulp-babel');
const coveralls = require('gulp-coveralls');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const istanbul = require('gulp-istanbul');
const minimist = require('minimist');
const mocha = require('gulp-mocha');
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');
const util = require('gulp-util');

const defaults = { type: 'patch' };
const options = minimist(process.argv.slice(2), defaults);

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

gulp.task('default', () => {
  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015-node4'],
      plugins: ['add-module-exports'],
      comments: false,
      babelrc: false,
    }))
    .on('error', util.log)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

// Aliases
gulp.task('validate', ['eslint']);
gulp.task('test', sequence('validate', 'mocha'));
gulp.task('build', ['default']);
