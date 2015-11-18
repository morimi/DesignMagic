/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
  'use strict';

  var csInterface = new CSInterface();
      //,localeStrings = csInterface.initResourceBundle();

  //Modules
  var Handlebars  = require("handlebars"),
      _           = require("lodash"),
      Q           = require("Q"),
      http        = require('http'),
      JSXRunner   = require("../common/JSXRunner"),
      conf   = require("../conf.json");

  //conf cache
  var confCache = null;

  //Elements
  var $content = $('#content'),
      $list = $('#message-list'),
      $config = $('#config-container'),
      $console = $('#console'),
      $loader = $('#icon-loader');

  var messageTmp = Handlebars.compile($('#message-template').html()),
      configTmp = Handlebars.compile($('#config-template').html()),
      infoTmp = Handlebars.compile($('#info-template').html()),
      consoleTmp = Handlebars.compile($('#console-template').html()),
      settingTmp = Handlebars.compile($('#setting-template').html());


  // 設定ファイルを外部から取得する
  function loadConfig() {
    var d = Q.defer();
    var url = window.localStorage.getItem('com.cyberagent.designmagic:conf.url');

    if (!url) {

      $console.html('URLが設定されていません');
      d.resolve(null);

    } else if ( confCache ) {

      d.resolve(confCache);

    } else {

     var req = http.get(url, function (res) {
        if (res.statusCode == '200') {
          res.setEncoding('utf8');
          res.on('data', function (data) {
            data = JSON.parse(data);
            data = _.defaults(data, conf);
            data.url = url;

            $console.html(data.name+'の設定ファイル(v'+ data.version +')の取得に成功しました');

            confCache = data;

            d.resolve(data);
          });
        }
      });

      req.on('error', function (res) {
        $console.html('デフォルト設定を利用しています');
        confCache = conf;
        d.resolve(conf);
      });

    }

    return d.promise;
  };

  /**
   * 設定表示
   * @param {Object} c config object
   */
  function displayConfig(c) {
    var d = Q.defer();
    if ( _.isObject(c) ) {
      $config.empty().append(configTmp(c));
    } else {
      $config.empty().append(settingTmp());
    }
    d.resolve(c);
    return d.promise;
  }


  /**
   * 単位チェック
   */
  function checkRulerUnits(c) {
    var d = Q.defer();

    if (conf.check.config.rulerUnits) {

      JSXRunner.runJSX("checkRulerUnits", {config: c.check.config}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var obj = (new Function("return " + result))();
        if (_.isObject(obj)) {
          $list.append(messageTmp(obj));
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise

  };


  /**
   * ドキュメントモードのチェック
   */
  function checkDocumentMode(c) {
    var d = Q.defer();

    if (conf.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var obj = (new Function("return " + result))();
        if (_.isObject(obj) && obj.title) {
          $list.append(messageTmp(obj));
          d.resolve(c);
        } else {
          d.reject(c);
        }
      });

    } else {

      d.resolve(c);

    }

      return d.promise
  };


  /**
   * ファイル名チェック
   */
  function checkFileName(c) {
    var d = Q.defer();

    if (_.isArray(conf.check.files.name)) {

      JSXRunner.runJSX("checkFileName", {config: c.check.files}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var obj = (new Function("return " + result))();
        if (_.isObject(obj)) {
          $list.append(messageTmp(obj));
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  };


  /**
   * ファイルサイズのチェック
   */
  function checkFileSize(c) {
    var d = Q.defer();

    if ( _.isNumber(c.check.files.size) ) {

      JSXRunner.runJSX("checkFileSize", {config: c.check.files}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
       var obj = (new Function("return " + result))();
        if (_.isObject(obj)) {
          $list.append(messageTmp(obj));
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  }

  /**
   * レイヤーカンプのチェック
   */
  function checkLayerComps(c) {
    var d = Q.defer();

    if ( c.check.files.useLayerComps ) {

      JSXRunner.runJSX("checkLayerComps", {config: c.check.files}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
       var obj = (new Function("return " + result))();
        if (_.isObject(obj)) {
          $list.append(messageTmp(obj));
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  }


  /**
   * Ratioのチェック
   */
  function checkDocumentRatio(c) {
    var d = Q.defer();

    if ( c.check.files.ratio ) {

      JSXRunner.runJSX("checkDocumentRatio", {config: c.check.files}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
       var obj = (new Function("return " + result))();
        if (_.isObject(obj)) {
          $list.append(messageTmp(obj));
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  }

  /**
   * レイヤーのチェック
   */
  function checkLayers(c) {
    var d = Q.defer();

    //この条件無限に増えそうな予感する
    if (c.check.layers.name || c.check.layers.blendingMode || c.check.fonts.absValue) {

      JSXRunner.runJSX("checkLayers", {config: c.check}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var r = (new Function("return " + result))();

        if ( _.isArray(r.list) && r.list.length ) {
          _.each(r.list, function(obj) {
            $list.prepend(messageTmp(obj));
          });
        }

        $('#hidden-total').text(r.hidden);

        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  }


  /**
   * エラーと注意の総数から罪の重さを量る
   * @param {number} errorNum エラー総数
   * @param {number} warnNum 注意総数
   * @return {number} 0 - 7 （罪の重さを8段階で返す）
   */
  function _calcGuilty(errorNum, warnNum) {
    var g = 0;

    if (( errorNum > 20 ) || ( warnNum > 120 )) g = 7;
    else if (( errorNum > 15 ) || ( warnNum > 90 )) g = 6;
    else if  (( errorNum > 10 ) || ( warnNum > 60 )) g = 5;
    else if  (( errorNum > 5 ) || ( warnNum > 30 )) g = 4;
    else if  (( errorNum > 1 ) || ( warnNum > 20 )) g = 3;
    else if  ( warnNum > 10 ) g = 2;
    else if  ( warnNum > 0 )  g = 1;

    return g;
  }


  /**
   * エラー・注意総数の表示、コンソールの表示
   */
  function displayResult(start){

    var errorNum = $list.find('.icon.error').length,
        warnNum  = $list.find('.icon.warn').length;

    var content = {
      time:  Math.abs((start - $.now()) / 1000) + 's',
      message: null,
      lv: _calcGuilty(errorNum, warnNum)
    };

    if ( errorNum > 0 ) {
      content.message = 'エラーの内容を確認してください';
    } else if (warnNum > 0) {
      content.message = 'いくつか注意点があるようです...';
    } else {
      content.message = '╭( ･ㅂ･)و ̑̑ ｸﾞｯ';
    }

    //エラーカウント
    $('#error-total').text(errorNum);
    $('#warn-total').text(warnNum);

    $console.empty().append(consoleTmp(content));
    console.log('╭( ･ㅂ･)و ̑̑ done!');

  }

  //Init
  function init() {

    themeManager.init();

    Q.fcall(loadConfig)
     .then(displayConfig)
     .done(function(c) {
        $list.append(infoTmp({conf: c}));
        $loader.hide();
    });

  }

  /**
   * Reset
   */
  function reset() {
    $config.hide();
    $list.empty().append(infoTmp());
    $console.empty();
    $('#error-total').text(0);
    $('#warn-total').text(0);
    $('#hidden-total').text(0);
    $loader.hide();
  }


  /**
   * Checkボタン押したとき
   */
  $('.btn-check').on('click', function() {

    $list.empty();
    $config.hide();
    $loader.show();

    var start = $.now();

    Q.fcall(loadConfig)
     .then(checkRulerUnits)
     .then(checkDocumentMode)
     .then(checkFileName)
     .then(checkFileSize)
     .then(checkLayerComps)
     .then(checkDocumentRatio)
     .then(checkLayers)
     .fail(function() {
      displayResult();
      $loader.hide();
    })
     .done(function() {
      displayResult(start);
      $loader.hide();
    });
  });


  /**
   * Configボタン押したとき
   */
  $('.btn-config').on('click', function() {
    $config.toggle();
  });


  /**
   * 設定ボタン押したとき
   */
  $('#config-container').on('click', '.js-btn-setting', function() {
    var input_url = $('#input-config-url').val();

    if ( _.isString(input_url) ) {
      window.localStorage.setItem('com.cyberagent.designmagic:conf.url', input_url);
      Q.fcall(loadConfig)
       .then(displayConfig)
       .done(function() {
        $list.append(infoTmp());
        $loader.hide();
      });
    }
  })
  .on('click', '.js-change-config-url', function() {
      $config.empty().append(settingTmp());
  })
  .on('click', '.js-btn-cancel', function() {
    if ( _.isObject(confCache) ) {
      $config.empty().append(configTmp(confCache));
    }
  });


  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

  //ドキュメント閉じた時
  csInterface.addEventListener( 'documentAfterDeactivate' , reset);



}());
