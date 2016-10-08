var gulp       = require('gulp');
var $          = require('gulp-load-plugins')();
var mocha      = require('gulp-mocha');
var jshint     = require('gulp-jshint');
var istanbul   = require('gulp-istanbul');

// settings
var codeCoverageThreshold = 90;
var buildOnceMode = true;

// runtime
var exitCode   = 0;

// Error handler used in testfail task to set an exit code to 1,
// this use to exit gulp improperly and throw an error from the build.
// this helps Jenkins know that there was an error which right now is still being picked up by build.sh
// using these lines of code
// # run gulp
// npm run-script build
// rc=$?; if [[ $rc != 0 ]]; then exit $rc; fi
function handleError(err) {
  exitCode = 1;
  //console.log('error status = 1');
  console.log('Gulpfile ErrorHandler: ' + err.toString());
  this.emit('end');
}


gulp.task('pretest', function () {
  return gulp.src(['app/*.js'])
    // Covering files
    .pipe(istanbul({ includeUntested: true }))
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', function() {
  return gulp.src('test/**/*.js')
		// gulp-mocha needs filepaths so you can't have any plugins before it
		.pipe(mocha({reporter: 'min'})) // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: buildOnceMode ? codeCoverageThreshold : 0 }}));
});

gulp.task('coveralls', ['test'], function () {
  if (!process.env.CI) {
    return;
  }

  return gulp.src(path.join(__dirname, 'coverage/lcov.info'))
    .pipe(coveralls());
});


gulp.task('lint', function() {
  return gulp.src(['private/**/*.js', 'app/**/*.js', 'config/**/*.js', 'db/**/*.js', '**/*.es'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});


 gulp.on('err', function (err) {
   if(buildOnceMode) {
      exitCode = 1;
      process.emit('exit'); // or throw err
    }
});

// on exit, force Gulp to exit with the error code of 1 if any of the tasks failed
process.on('exit', function () {
  if(buildOnceMode) {
    process.exit(exitCode);
  }
});

gulp.task('development', function() {
  buildOnceMode = false;
});

// this is the default task, so if you run gulp without any parameters,
// it will start up as a watch program and run tasks as you modify files
// its not async, so it locks up one of your terminal windows
gulp.task('default', ['development', 'lint', 'pretest', 'test'], function() {
  gulp.watch(['test/unit/*.js', 'app/**/*.js'], ['pretest', 'test']); // Pretest is caching covered class, need to fix before it useful
  gulp.watch(['app/**/*.js', 'app/**/*.js', 'config/**/*.js', 'db/**/*.js'], ['lint']);
});
