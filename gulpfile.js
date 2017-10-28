var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp        = require('child_process');
var pug        = require('gulp-pug');
var plumber = require('gulp-plumber');
var coffee = require('gulp-coffee');
var gutil = require('gulp-util');
// var jade        = require('gulp-jade');


var jekyll   = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    // return cp.exec( jekyll , ['build', '--incremental'], {stdio: 'inherit'})
    //   .on('close', done);
    return cp.spawn( jekyll , ['build', '--incremental'], {stdio: 'inherit'})
      .on('close', done);
    // return cp.exec('jekyll', ['build'], {stdio: 'inherit'}).on('close', done);
    //     .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
 gulp.src('./src/*.ext')
 	.pipe(plumber())
 	.pipe(coffee())
 	.pipe(gulp.dest('./dist'));

 //added rebuild v
gulp.task('browser-sync', ['sass', 'pug', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: './'        },
            port: 8800
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('sass/**/*.+(sass|scss)')
        .pipe(plumber())
        .pipe(sass({
            includePaths: ['scss','sass'],
            onError: browserSync.notify,
            errLogToConsole: true

        }))
        .on('error', catchErr)
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
        // .pipe(gulp.dest('css/_assets/'));
});

function catchErr(e) {
  console.log(e);
  this.emit('end');
}
/*
* Jade files
*/
gulp.task('pug', function(){
  return gulp.src('_pug/*.pug')
  .pipe(pug())
  .pipe(gulp.dest('_includes'))
  .pipe(browserSync.reload({stream:true}))

})

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('sass/**/*.+(sass|scss)', ['sass']);
    gulp.watch('_pug/*.pug', ['pug']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html'], ['jekyll-rebuild']);
    gulp.watch(['*.js', 'js/*.js'], ['jekyll-rebuild']);
    gulp.watch(['_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);
