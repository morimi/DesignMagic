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
      infoTmp = Handlebars.compile($('#info-template').html());


  // 設定ファイルを外部から取得する
  function loadConfig() {
    var d = Q.defer();

    if (!conf.url) {

      $console.html('デフォルト設定を利用しています');
      d.resolve(conf);

    } else if ( confCache ) {

      d.resolve(confCache);

    } else {

     var req = http.get(conf.url, function (res) {
        if (res.statusCode == '200') {
          res.setEncoding('utf8');
          res.on('data', function (data) {
            data = JSON.parse(data);
            data = _.defaults(data, conf);

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

    return d.promise
  };

  /**
   * 設定表示
   * @param {Object} c config object
   */
  function displayConfig(c) {
    if ( _.isObject(c) ) {
      $config.append(configTmp(c));
    }
  }

  /**
   * ドキュメントモードのチェック
   */
  function checkDocumentMode(c) {
    var d = Q.defer();

    if (conf.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {
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
   * レイヤーのチェック
   */
  function checkLayers(c) {
    var d = Q.defer();
    var start = $.now();

    if (c.check.layers.name || c.check.layers.blendingMode) {

      JSXRunner.runJSX("checkLayers", {config: c.check.layers}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var r = (new Function("return " + result))();

        if ( _.isArray(r.list) && r.list.length ) {
          _.each(r.list, function(obj) {
            $list.prepend(messageTmp(obj));
          });
        }

        $('#hidden-total').text(r.hidden);

        console.log("checkLayers:" + Math.abs((start - $.now()) / 1000) + 's');
        console.log('hidden: ' + r.hidden);
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  }


  /**
   * エラー総数の表示
   */
  function countResult(val){

    var errorNum = $list.find('.icon.error').length,
        warnNum  = $list.find('.icon.warn').length;

    //エラーカウント
    $('#error-total').text(errorNum);
    $('#warn-total').text(warnNum);

    if ( errorNum > 0 ) {
      $console.html('<p>エラーの内容を確認してください...</p>');
    } else if (warnNum > 0) {
      $console.html('<p>いくつか注意点があるようです...</p>');
    } else {
      $console.html('<p>╭( ･ㅂ･)و ̑̑ ｸﾞｯ</p>');
    }

    console.log('╭( ･ㅂ･)و ̑̑ done!');

  }

  //Init
  function init() {

    themeManager.init();

    Q.fcall(loadConfig)
     .then(displayConfig)
     .done(function() {
      $list.append(infoTmp());
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
  }


  $('.btn-check').on('click', function() {
    $list.empty();
    $config.hide();
    $loader.show();

    Q.fcall(loadConfig)
     .then(checkDocumentMode)
     .then(checkRulerUnits)
     .then(checkFileName)
     .then(checkFileSize)
     .then(checkLayerComps)
     .then(checkLayers)
     .done(function() {
      countResult();
      $loader.hide();
    });
  });


  $('.btn-config').on('click', function() {
    $config.toggle();
  });

  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

  //ドキュメント閉じた時
  csInterface.addEventListener( 'documentAfterDeactivate' , reset);


}());
