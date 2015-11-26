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
      Strings     = require("./js/LocStrings");


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

  var RULERUNITS_LABEL = {
    CM: 'cm',
    INCHES: 'inch',
    MM: 'mm',
    PERCENT: '%',
    PICAS: 'pica',
    POINTS: 'pt',
    PIXELS: 'px'
  };

  // 設定ファイルを外部から取得する
  function loadConfig() {
    var d = Q.defer();
    var url = window.localStorage.getItem('com.cyberagent.designmagic:conf.url');

    if (!url) {

      $console.html(Strings.Pr_MESSAGE_NOT_SETTING_URL);
      d.resolve(null);

    } else if ( confCache && confCache.url === url ) {

      d.resolve(confCache);

    } else {

     var req = http.get(url, function (res) {
        if (res.statusCode == '200') {
          res.setEncoding('utf8');
          res.on('data', function (data) {
            data = JSON.parse(data);
            data.url = url;
            data.Strings = Strings;

            $console.html(Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);

            confCache = data;

            d.resolve(data);
          });
        }
      });

      req.on('error', function (res) {
        var conf   = require("../conf.json")
        $console.html(Strings.Pr_MESSAGE_USE_DEFAULT_CONFIG);
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

      c = _.extend({
          theme: themeManager.getThemeColorType(),
          Strings: Strings
       }, c );

      $config.empty().append(configTmp(c));

    } else {

      $config.empty().append(settingTmp({
          theme: themeManager.getThemeColorType(),
          Strings: Strings
       }));
    }

    d.resolve(c);
    return d.promise;
  }

  /**
   * string を テンプレート用のobjectに変換
   * UIテーマ(dark, light)を追加する
   * http://hamalog.tumblr.com/post/4047826621/json-javascript
   * @param {string} str
   * @return {Object}
   */
  function _stringToObject(str) {
    var obj = (new Function("return " + str))();

    obj = _.extend({
        theme: themeManager.getThemeColorType(),
        Strings: Strings
     }, obj || {});

    return obj;
  }


  /**
   * LocalStrings通したバリデーションメッセージ作成
   * @param {string} rule 'RULERUNITS' 全部大文字のルール
   * @param {string} type 'error','valid','warn'
   */
  function _getValidationMessage(rule, type) {
    return Strings['Pr_' + type.toUpperCase() + '_' + rule];
  }


  /**
   * 単位チェック
   */
  function checkRulerUnits(c) {
    var d = Q.defer();

    if (c.check.config.rulerUnits) {

      JSXRunner.runJSX("checkRulerUnits", {config: c.check.config}, function (result) {

        var obj = _stringToObject(result),
            label =  RULERUNITS_LABEL[c.check.config.rulserUnitsType],
            unit = RULERUNITS_LABEL[obj.value.replace('Units.', '')];

        if (_.isObject(obj)) {
          obj.title = Strings.formatStr(_getValidationMessage('RULERUNITS', obj.type), unit);

          if ( obj.type === 'error') {
            obj.hint = [_getValidationMessage('RULERUNITS', 'hint', label)];
          }

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
   * ドキュメントモードのチェック
   */
  function checkDocumentMode(c) {
    var d = Q.defer();

    if (c.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {

        var obj = _stringToObject(result);
        if (_.isObject(obj) && obj.type) {
          obj.value = obj.value.replace("DocumentMode.","");
          obj.title = Strings.formatStr(_getValidationMessage('DOCUMENTMODE', obj.type), obj.value);

          if ( obj.type === 'error' ) {
            obj.hint = [Strings.formatStr(_getValidationMessage('DOCUMENTMODE', 'hint'), label)];
          }

          $list.append(messageTmp(obj));
          d.resolve(c);

        } else {
          d.reject(c);
        }
      });

    } else {

      d.resolve(c);

    }

      return d.promise;
  };


  /**
   * ファイル名チェック
   */
  function checkFileName(c) {
    var d = Q.defer();

    if (_.isArray(c.check.files.name)) {
      JSXRunner.runJSX("checkFileName", {config: c.check.files}, function (result) {

        var obj = _stringToObject(result);
        if (_.isObject(obj) && obj.type ) {

          obj.title = _getValidationMessage('DOCUMENTNAME', obj.type);

          if ( obj.type === 'error' ) {
            obj.hint = [_getValidationMessage('DOCUMENTNAME', 'hint')];
          }

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

        var obj = _stringToObject(result);
        if (_.isObject(obj) && obj.type) {

          obj.title = Strings.formatStr(_getValidationMessage('FILESIZE', obj.type), obj.value, obj.limit);

          if ( obj.type !== 'valid' ) {
            obj.hint = [Strings.formatStr(_getValidationMessage('FILESIZE', 'hint'), obj.value, obj.limit)];
          }

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

        var obj = _stringToObject(result);
        if (_.isObject(obj)) {
          var value = parseInt(obj.value);

          obj.title = [Strings.formatStr(_getValidationMessage('LAYERCOMPS', obj.type), obj.value)];


          if (obj.type === 'valid' && !value) {
            obj.hint = [Strings.formatStr(_getValidationMessage('LAYERCOMPS', 'select'), obj.value)];
          }

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

        var obj = _stringToObject(result);
        if (_.isObject(obj) && obj.type ) {
          var unit =  RULERUNITS_LABEL[c.check.config.rulserUnitsType];
          obj.title = _getValidationMessage('DOCUMENTRATIO', obj.type, obj.value);

          if ( obj.type === 'error') {
            obj.hint = [Strings.formatStr(_getValidationMessage('DOCUMENTRATIO', 'hint'), (c.check.files.ratio * 320) + unit)];
          }

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

    if ( _.isObject(c.check.layers) && _.isObject(c.check.fonts) ) {

      JSXRunner.runJSX("checkLayers", {config: c.check, Strings: Strings}, function (result) {

        var r = _stringToObject(result);

        if ( _.isArray(r.list) && r.list.length ) {
          _.each(r.list, function(obj) {
            obj.theme = r.theme;

            _.each(obj.hint, function(h, i) {
              switch(h) {
                case 'FONT_MINSIZE':
                  obj.hint[i] = Strings.formatStr(_getValidationMessage(h + '_LAYERS', 'hint'), c.check.fonts.minSize + RULERUNITS_LABEL[c.check.config.rulserUnitsType]);
                  break;
                default:
                  obj.hint[i] = _getValidationMessage(h + '_LAYERS', 'hint');
              }

            });

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
      //エラーの内容を確認してください
      content.message = Strings.Pr_MESSAGE_CHECK_ERROR;
    } else if (warnNum > 0) {
      //いくつか注意点があるようです
      content.message = Strings.Pr_MESSAGE_CHECK_WARN;
    } else {
      content.message = Strings.Pr_MESSAGE_CHECK_SUCCESS;
    }

    //エラーカウント
    $('#error-total').text(errorNum);
    $('#warn-total').text(warnNum);

    $console.empty().append(consoleTmp(content));

  }

  //Init
  function init() {

    themeManager.init();

    Q.fcall(loadConfig)
     .then(displayConfig)
     .done(function(c) {
        setEventListeners();
        $list.append(infoTmp({conf: c, Strings: Strings}));
        $loader.hide();
    });

  }

  /**
   * Reset
   */
  function reset() {
    $config.hide();
    $list.empty().append(infoTmp({conf: confCache, Strings: Strings}));
    $console.empty();
    $('#error-total').text(0);
    $('#warn-total').text(0);
    $('#hidden-total').text(0);
    $loader.hide();

  }


  /**
   * Check
   */

  function check() {
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
    })
     .done(function() {
      displayResult(start);
      $loader.hide();
    });
  }

  /**
   * csInterface イベントリスナーの設定
   */
  function setEventListeners() {

    //ドキュメント保存したときの自動チェック
    var autocheck = window.localStorage.getItem('com.cyberagent.designmagic:autocheck') === 'true';

    $('.js-is-autocheck').attr('checked', autocheck);

    if ( autocheck ) {
      csInterface.addEventListener( 'documentAfterSave' , check);
    }

  }


  /**
   * Checkボタン押したとき
   */
  $('.btn-check').on('click', check);


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
       .done(function(c) {
        $list.empty().append(infoTmp({conf: c, Strings:Strings}));
        $loader.hide();
      });
    }
  })
  .on('click', '.js-change-config-url', function() {
      $config.empty().append(settingTmp({Strings:Strings}));
  })
  .on('click', '.js-btn-cancel', function() {
    if ( _.isObject(confCache) ) {
      confCache.Strings = Strings;
      $config.empty().append(configTmp(confCache));
    }
  })
  .on('change', '.js-is-autocheck', function() { //ドキュメント保存したときの自動チェック
    var autocheck = $(this).is(':checked');

    window.localStorage.setItem('com.cyberagent.designmagic:autocheck', autocheck);

    if ( autocheck ) {
      csInterface.addEventListener( 'documentAfterSave' , check);
    } else {
      csInterface.removeEventListener( 'documentAfterSave' , check);
    }
  })
  .on('click', '.js-btn-reset', function () {
    window.localStorage.clear();
    $config.empty().append(settingTmp({Strings:Strings}));
  });


  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

  //ドキュメント閉じた時
  csInterface.addEventListener( 'documentAfterDeactivate' , reset);


}());
