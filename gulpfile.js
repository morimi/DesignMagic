/**
 * @fileoverview gulpfile.js
 *
 * @description
 * #### ■ 概要
 * タスクランナーGulp のコマンド一覧になります。
 * コマンドライン上で実行することで DesignMagic のエクステンションを生成することなどが可能です。
 *
 * #### ■ コマンド一覧
 * 現在用意されているタスクは以下になります。
 *
 * **ビルドを実行する**
 * ```
 * gulp build
 * ```
 * **不要なファイルを削除する**
 * ```
 * gulp clean
 * ```
 * **src 内の node_modules を削除した後に複製する**
 * ```
 * gulp ndm
 * ```
 * **ドキュメントを生成する**
 * ```
 * gulp docs
 * ```
 * **証明書を生成する**
 * ```
 * gulp cert
 * ```
 * **エクステンションを生成する**
 * ```
 * gulp createzxp
 * ```
 * **src 内の ndm を削除する**
 * ```
 * gulp src_ndm_clean
 * ```
 * **src 内の node_modules を複製する**
 * ```
 * gulp src_ndm_copy
 * ```
 */

var gulp = require('gulp');
var exec = require('gulp-exec');
var del  = require('del');


/**
 * options
 * @private
 * @type {Object}
 */
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

/**
 * exec options
 * @private
 * @type {Object}
 */
var reportOptions = {
  err    : true, // default = true, false means don't write err
  stderr : true, // default = true, false means don't write stderr
  stdout : true // default = true, false means don't write stdout
};

/**
 * DesignMagic のドキュメントを生成します。
 * @return {Function}
 */
function docs() {
  return gulp.src( '.' )
    .pipe( exec('node_modules/.bin/jsdoc -c jsdoc.json', options) )
    .pipe( exec('node_modules/.bin/jsdoc -c jsdoc-jsx.json', options) )
    .pipe( exec('node_modules/.bin/jsdoc -c jsdoc-gulpfile.json', options) )
    .pipe( exec.reporter(reportOptions) );
}
gulp.task( 'docs', docs );

/**
 * DesignMagic を build する際に使用する証明書発行します。
 * @return {Function}
 */
function cert() {
  return gulp.src( '.' )
    .pipe( exec('<%= options.path.cmd %> -selfSignedCert JP Tokyo Cyberagent MisakiMori <%= options.passsword.cert %> <%= options.path.cert %>', options) )
    .pipe( exec.reporter(reportOptions) );
}
gulp.task( 'cert', cert );

/**
 * src 内の node_modules を削除します。
 * @param {Function} callback
 * @return {Function}
 */
function src_ndm_clean(callback) {
  del(options.path.src + '/node_modules', {force: false}, function (error, paths) {
    if (error) {
      console.log('error: ' + error);
    } else {
      console.log('clean: ' + paths);
    }
    callback();
  });
}
gulp.task( 'src_ndm_clean', src_ndm_clean );

/**
 * node_modules を src 内にコピーします。
 * @return {Function}
 */
function src_ndm_copy() {
  return gulp.src( '.' )
    .pipe( exec('cp -r ./node_modules <%= options.path.src %>', options) )
    .pipe( exec.reporter(reportOptions) );
}
gulp.task( 'src_ndm_copy', src_ndm_copy );


/**
 * 前回の build 後に作成したファイルなどを削除し、生成するための準備を整えます。
 * @param {Function} callback
 * @return {Function}
 */
function build_clean(callback) {
  del(options.path.build, {force: false}, function (error, paths) {
    if (error) {
      console.log('error: ' + error);
    } else {
      console.log('clean: ' + paths);
    }
    callback();
  });
}
gulp.task( 'build_clean', build_clean );


/**
 * DesignMagic.zxp を生成します。
 * @return {Function}
 */
function createzxp() {
  return gulp.src( '.' )
    .pipe( exec('mkdir <%= options.path.build %>', options) )
    .pipe( exec('<%= options.path.cmd %> -sign "<%= options.path.src %>" <%= options.path.zxp %> <%= options.path.cert %> <%= options.passsword.cert %>', options) )
    .pipe( exec.reporter(reportOptions) );
}
gulp.task( 'createzxp', createzxp );



gulp.task('copy', function () {
  var libs = [
    'bower_components/riot/riot+compiler.min.js',
    'bower_components/lodash/lodash.js',
    'bower_components/q/q.js',
    'bower_components/node-uuid/uuid.js'
  ];

  gulp.src(libs)
    .pipe(gulp.dest('src/PSPanel/js/libs'));

});


/**
 * gulp のデフォタスク
 */
gulp.task( 'build', ['build_clean', 'createzxp'] );
gulp.task( 'clean', ['build_clean', 'src_ndm_clean'] );
gulp.task( 'ndm', ['src_ndm_clean', 'src_ndm_copy'] );
