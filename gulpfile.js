var gulp = require('gulp');
var exec = require('gulp-exec');
var del  = require('del');


// options
var options = {
  path: {
    src   : './src',
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
 * 証明書発行
 * @param  {String} 'cert'
 */
gulp.task( 'cert', function () {
  return gulp.src( '.' )
    .pipe( exec('<%= options.path.cmd %> -selfSignedCert JP Tokyo Cyberagent MisakiMori <%= options.passsword.cert %> <%= options.path.cert %>', options) )
    .pipe( exec.reporter(reportOptions) );
});

/**
 * src 内の node_modules を削除
 * @param  {String} 'src-ndm-clean'
 */
gulp.task( 'src-ndm-clean', function (callback) {
  del(options.path.src + '/node_modules', {force: false}, function (error, paths) {
    if (error) {
      console.log('error: ' + error);
    } else {
      console.log('clean: ' + paths);
    }
    callback();
  });
});

/**
 * node_modules を src 内にコピー
 * @param  {String} 'src-ndm-copy'
 */
gulp.task( 'src-ndm-copy', function () {
  return gulp.src( '.' )
    .pipe( exec('cp -r ./node_modules <%= options.path.src %>/node_modules', options) )
    .pipe( exec.reporter(reportOptions) );
});


/**
 * build の後始末
 * @param  {String} 'clean'
 */
gulp.task( 'build-clean', function (callback) {
  del(options.path.build, {force: false}, function (error, paths) {
    if (error) {
      console.log('error: ' + error);
    } else {
      console.log('clean: ' + paths);
    }
    callback();
  });
});


/**
 * DesignMagic.zxp を生成する
 * @param  {String} 'build'
 */
gulp.task( 'build', function () {
  return gulp.src( '.' )
    .pipe( exec('mkdir <%= options.path.build %>', options) )
    .pipe( exec('<%= options.path.cmd %> -sign "<%= options.path.src %>" <%= options.path.zxp %> <%= options.path.cert %> <%= options.passsword.cert %>', options) )
    .pipe( exec.reporter(reportOptions) );
});


/**
 * gulp のデフォタスク
 * @param  {String} 'default'
 * @param  {Array}
 */
gulp.task( 'build', ['build-clean', 'build'] );
gulp.task( 'clean', ['build-clean', 'src-ndm-clean'] );
gulp.task( 'ndm', ['src-ndm-clean', 'src-ndm-copy'] );
