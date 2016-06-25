const babel = require('gulp-babel');
const bump = require('gulp-bump');
const eslint = require('gulp-eslint');
const gulp = require('gulp');
const minimist = require('minimist');
const mocha = require('gulp-mocha');
const sequence = require('gulp-sequence');
const sourcemaps = require('gulp-sourcemaps');

const defaults = { type: 'patch' };
const options = minimist(process.argv.slice(2), defaults);


gulp.task('eslint', () => {
  return gulp.src(['src/**/*.js', 'test/**/*.js', 'gulpfile.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('mocha', () => {
  return gulp.src('test/test.js', { read: false, timeout: 5000 })
    .pipe(mocha());
});

gulp.task('bump', () => {
  gulp.src('./package.json')
  .pipe(bump({ type: options.type }))
  .pipe(gulp.dest('./'));
});

gulp.task('watch', () => {
  return gulp.watch(['src/**/*.js'], ['default']);
});

gulp.task('default', () => {
  function reportError(error) {
    // If you want details of the error in the console
    console.warn(error.toString());
    console.warn(error.message);

    this.emit('end');
  }

  // TODO We should merge these two streams
  gulp.src(['src/**/*.json'])
    .pipe(gulp.dest('lib'));

  return gulp.src(['src/**/*.js'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015-node4'],
      plugins: ['add-module-exports'],
      comments: false,
      babelrc: false,
    }))
    .on('error', reportError)
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('lib'));
});

// Aliases
gulp.task('validate', ['eslint']);
gulp.task('test', sequence('validate', 'mocha'));
gulp.task('build', ['default']);
