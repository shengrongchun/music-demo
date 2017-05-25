var gulp = require('gulp');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var del = require('del');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');

// Clean
// -------------------------------
gulp.task('clean:build', function() {
    return del('dist/**');
});
//image
gulp.task('images', function() {
    gulp.src('webroot/img/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
});
// Usemin
// ---------
var paths = {
    scripts:['webroot/js/ajax.js','webroot/js/musicList.js','webroot/js/function.js','webroot/js/music.js'],
    css: ['webroot/css/common.css','webroot/css/music.css','webroot/css/query.mCustomScrollbar.min.css']
}
gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(uglify())
    .pipe(concat('main.min.js'))
    .pipe(gulp.dest('dist/js'));
});
gulp.task('css', function() {
  gulp.src(paths.css)
    .pipe(minifyCSS())
    .pipe(concat('main.min.css'))
    .pipe(gulp.dest('dist/css'));
});








gulp.task('default', ['clean:build','images', 'scripts','css']);