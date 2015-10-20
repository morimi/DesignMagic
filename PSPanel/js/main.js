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

  //Elements
  var $content = $('#content'),
      $list = $('#message-list'),
      $console = $('#console');

  var template = Handlebars.compile($('#message-template').html());


  // 設定ファイルを外部から取得する
  function loadConfig() {
    var d = Q.defer();

    if (!conf.url) {

      d.resolve(conf);

    } else {

     var req = http.get(conf.url, function (res) {
        if (res.statusCode == '200') {
          res.setEncoding('utf8');
          res.on('data', function (data) {
            data = JSON.parse(data);
            data = _.defaults(data, conf);

            $list.append(template({
              title: data.name+'の設定ファイル(v'+ data.version +')の取得に成功しました',
              hint: "",
              type: "valid"
            }));

            d.resolve(data);
          });
        }
      });

      req.on('error', function (res) {
        $list.append(template({
          title: '設定ファイルの取得に失敗しました',
          hint: "デフォルト設定を使用します",
          type: "warn"
        }));
        d.resolve(data);
      });

    }

    return d.promise
  };

  /**
   *
   */
  function checkDocumentMode(c) {
    var d = Q.defer();

    if (conf.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var obj = (new Function("return " + result))();
        $list.append(template(obj));
      });

      d.resolve(c);

    } else {

      d.resolve(c);

    }

      return d.promise
  };

  /**
   *
   */
  function checkRulerUnits(c) {
    var d = Q.defer();

    if (conf.check.config.rulerUnits) {

      JSXRunner.runJSX("checkRulerUnits", {config: c.check.config}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var obj = (new Function("return " + result))();
        $list.append(template(obj));
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise

  };

  /**
   *
   */
  function checkFileName(c) {
    var d = Q.defer();

    if (_.isArray(conf.check.files.name)) {

      JSXRunner.runJSX("checkFileName", {config: c.check.files}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var obj = (new Function("return " + result))();
        $list.append(template(obj));
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise

  };


  /**
   *
   */
  function checkLayers(c) {
    var d = Q.defer();

    if (c.check.layers.name || c.check.layers.blendingMode) {

      JSXRunner.runJSX("checkLayers", {config: c.check.layers}, function (result) {
        //http://hamalog.tumblr.com/post/4047826621/json-javascript
        var array = (new Function("return " + result))();
        _.each(array, function(obj) {
          $list.prepend(template(obj));
        });
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise

  }

  //Init
  function init() {

    themeManager.init();

    Q.fcall(loadConfig)
     .then(checkDocumentMode)
     .then(checkRulerUnits)
     .then(checkFileName)
     .then(checkLayers)
     .done(function(val){

      var errorNum = $list.find('.icon.error').length;
        //エラーカウント
        $('#error-total').text(errorNum);
        $('#warn-total').text($list.find('.icon.warn').length);

      if ( errorNum > 0 ) {
        $console.html('<p>エラーの内容を確認してください...</p>');
      } else {
        $console.html('<p>╭( ･ㅂ･)و ̑̑ ｸﾞｯ</p>');
      }

    });


  }


  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

}());
