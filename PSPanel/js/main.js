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
      $list = $('#message-list');

  var template = Handlebars.compile($('#message-template').html());


  // 設定ファイルを外部から取得する
  function confLoader(callback) {
    if (!conf.url) {
      callback && callback(conf);
    }

    var req = http.get(conf.url, function (res) {
      if (res.statusCode == '200') {
        res.setEncoding('utf8');
        res.on('data', function (data) {
          data = JSON.parse(data);
          data = _.defaults(data, conf);

          var obj = (new Function("return " + '{title: "'+data.name+'の設定ファイル(v'+ data.version +')の取得に成功しました。", hint: "", type: "valid"}'))();
          $list.append(template(obj));

          callback && callback(data);
        });
      }
    });
    req.on('error', function (res) {
      var obj = (new Function("return " + '{title: "設定ファイルの取得に失敗したので、デフォルトの設定を使用します。", hint: "", type: "error"}'))();
      $list.append(template(obj));
      // callback && callback();
    });
  }

  //Init
  function init() {

    themeManager.init();

    confLoader(function (conf) {

      if (conf.check.config.documentMode) {
        JSXRunner.runJSX("checkDocumentMode", {config: conf.check.config}, function (result) {
          //http://hamalog.tumblr.com/post/4047826621/json-javascript
          var obj = (new Function("return " + result))();
          $list.append(template(obj));
        });
      }

      if (conf.check.config.rulerUnits) {
        JSXRunner.runJSX("checkRulerUnits", {config: conf.check.config}, function (result) {
          //http://hamalog.tumblr.com/post/4047826621/json-javascript
          var obj = (new Function("return " + result))();
          $list.append(template(obj));
        });
      }

      if (conf.check.layers.name) {
        JSXRunner.runJSX("checkLayerName", null, function (result) {
          //http://hamalog.tumblr.com/post/4047826621/json-javascript
          var array = (new Function("return " + result))();
          _.each(array, function(obj) {
            $list.prepend(template(obj));
          });
        });
      }

      $('#message-list').on('click', '.message', function(e) {
          alert($(this).text())
      });
    });

  }

  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

}());
