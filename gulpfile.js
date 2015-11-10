var gulp = require('gulp');
var exec = require('gulp-exec');


// options
var options = {
  path: {
    build : './build',
    zxp   : './build/DesignMagic.zxp',
    cmd   : './tools/build/ZXPSignCmd',
    cert  : './tools/build/cert.p12'
  },
  passsword: {
    cert  : 'test123'
  }
};

// exec options
var reportOptions = {
  err    : true, // default = true, false means don't write err
  stderr : true, // default = true, false means don't write stderr
  stdout : true // default = true, false means don't write stdout
};


/**
 * build の後始末
 * @param  {String} 'clean'
 */
gulp.task( 'clean', function () {
  gulp.src( '.' )
    .pipe( exec('rm -rf <%= options.path.build %>', options) )
    .pipe( exec.reporter(reportOptions) )
});


/**
 * DesignMagic.zxp を生成する
 * @param  {String} 'build'
 */
gulp.task( 'build', function () {
  gulp.src( '.' )
    .pipe( exec('mkdir <%= options.path.build %>', options) )
    .pipe( exec('<%= options.path.cmd %> -sign "." <%= options.path.zxp %> <%= options.path.cert %> <%= options.passsword.cert %>', options) )
    .pipe( exec.reporter(reportOptions) );
});


/**
 * gulp のデフォタスク
 * @param  {String} 'default'
 * @param  {Array}
 */
gulp.task( 'default', ['clean', 'build'] );
