var gulp = require('gulp');
var gls = require('gulp-live-server');
var gulpCopy = require('gulp-copy');
// Development Script
gulp.task('serve', function() {
    // serve with default settings
    var server = gls.static(['.'],3000); //equals to gls.static('public', 3000);
    server.start();

    //use gulp.watch to trigger server actions(notify, start or stop)
    gulp.watch(['js/**/*.js','style/**/*.css', 'view/**/*.html'], server.notify);
});

// Copying to build folder
gulp.task('copy', function() {
    // serve with default settings
    console.log('Copying...');
    return gulp.src('./view/*.html')
  .pipe(gulpCopy('./dist/'));
});

// Run all task before running 'default'
gulp.task('default',['serve']);

gulp.task('build',['copy']);
