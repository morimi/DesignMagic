/**
 * @fileoverview Design Magic main.js (RiotJS ver)
 *
 */


var csInterface = new CSInterface();
var extensionId =  csInterface.getExtensionID();
//Modules
var _           = require("lodash"),
    Q           = require("Q"),
    http        = require('http'),
    JSXRunner   = require("../common/JSXRunner"),
    Strings     = require("./js/LocStrings");

/**
 * DesignMagic
 */

window.DM = {};


/**
 * 単位
 * @const
 */
DM.UNITS_LABEL = {
    CM: 'cm',
    INCHES: 'inch',
    MM: 'mm',
    PERCENT: '%',
    PICAS: 'pica',
    POINTS: 'pt',
    PIXELS: 'px'
  };


/**
 * <app>のmount時に実行
 * conf.jsonの読み込み
 */
DM.init = function() {

  themeManager.init();

  Q.fcall(DM.loadConfig)
   .done(function() {
    DM.app.loading = false;
    riot.update();
    console.log('╭( ･ㅂ･)و ̑̑ ｸﾞｯ');
  })

};



/**
 * 設定ファイルを取得する
 * @return {Promise} Q.defer promise object
 */
DM.loadConfig = function() {

  var d = Q.defer();
  var url = window.localStorage.getItem('com.cyberagent.designmagic:conf.url');
  var localData = window.localStorage.getItem('com.cyberagent.designmagic:conf.result');

  /**
   * conf.jsonのテキストをObjectに変換
   * ついでにテンプレート用の'theme'と'Strings'も追加する
   * @param {string} dataStr conf.jsonの中身
   * @param {string} url data.urlに追加する文字列
   * @param {Object} conf.jsonのオブジェクト
   */
  var parseData = function(dataStr, url) {
    var data = JSON.parse(dataStr);
    data = _.defaultsDeep(data, DM.app.conf);
    data.url = url;

    data = _.extend({
        theme: themeManager.getThemeColorType(),
        Strings: Strings
     }, data );

    DM.app.confCache = data;

    return data;
  };

  //urlもローカルファイルもない
  if (!url && localData && !DM.app.localConfFile ) {

    DM.app.consoleText = Strings.Pr_MESSAGE_NOT_SETTING_FILE;
    d.resolve(null);

  //キャッシュあった
  } else if ( DM.app.confCache && DM.app.confCache.url === url ) {

    console.info('[loadConfig]Find local conf.json cache');
    d.resolve(DM.app.confCache);

  //ストレージに保存されてた
  } else if ( localData && (url === 'localhost') ) {

    var data = parseData(localData, 'localhost');
    DM.app.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;

    d.resolve(data);

  //ローカルファイルが指定された
  } else if ( (DM.app.localConfFile && DM.app.localConfFile.type === 'application/json') ) {

    console.info('[loadConfig]Loading local conf.json file data');

    return DM.loadLocalConfig();

  //リモートのファイルが指定された
  } else {

    console.info('[loadConfig]Loading remote conf.json ....');

    return DM.loadRemoteConfig(url);
  }

  return d.promise;

};

/**
 * リモートのconf.jsonをとりにいく
 * 取れたら中身をオブジェクトに変換してvm.confCacheにセットする。
 * 取れなかった場合はDM.confを代用してセットする。
 * @param {string} url Request url
 * @return {Promise} Q.defer promise object
 */
DM.loadRemoteConfig = function(url) {
  var d = Q.defer();

  /**
   * @param {XMLHttpRequest} xhr
   */
  var handleLoadConfigError = function(xhr) {

    if ( xhr.status >= 300) {
      DM.app.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;
      DM.app.confCache = DM.app.conf;
    }

  };

  var req = http.get(url, function (res) {

    if (res.statusCode == '200') {
      res.setEncoding('utf8');
      res.on('data', function (data) {
        data = JSON.parse(data);
        data = _.defaultsDeep(data, DM.app.conf);
        data = _.extend({
          url: url,
          theme: themeManager.getThemeColorType(),
          Strings: Strings
        }, data );
        DM.app.confCache = data;

        DM.app.trigger('confCache', data);

        DM.app.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;
        d.resolve(data);
      });
    }

    if (res.statusCode == '403') {
      handleLoadConfigError();
      d.resolve(DM.app.confCache);
    }
  });


  req.on('error', function() {
    handleLoadConfigError();
    d.resolve(DM.app.confCache);
  });

  return d.promise;

};

/**
 * ローカルのconfファイルを読み込む
 * 成功したらvm.confCacheにセットする
 * 失敗した場合はDM.confを代用してセットする。
 * @return {Promise} Q.defer promise object
 */
DM.loadLocalConfig = function () {
  var d = Q.defer();
  var reader = new FileReader();

  reader.onload = function(e) {

    switch (e.target.readyState) {

      case FileReader.DONE : // DONE == 2
        var result = e.target.result;
        var data = JSON.parse(result);

        window.localStorage.setItem('com.cyberagent.designmagic:conf.url', 'localhost');
        window.localStorage.setItem('com.cyberagent.designmagic:conf.result', result);

        data = _.defaultsDeep(data, DM.app.conf);
        data = _.extend({
          url: 'localhost',
          theme: themeManager.getThemeColorType(),
          Strings: Strings
        }, data );

        DM.app.confCache = data;
        DM.app.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;
        DM.app.localConfFile = null;

        d.resolve(data);
      break;

    }
  };

  reader.onerror = function() {
    DM.app.consoleText = Strings.Pr_MESSAGE_USE_DEFAULT_CONFIG;
    DM.app.confCache = self.conf;
    d.resolve(DM.app.conf);
  };

  reader.readAsText(this.localConfFile);

  return d.promise;

};


/**
 * .hd-btn イベントハンドラ
 * data-modeの値 'check', 'config', 'tools', 'change' を mode イベント トリガーに渡す
 * @param {MouseEvent} e
 */
DM.switchContainer = function(e) {
  var mode = e.currentTarget.getAttribute('data-mode')
  console.log('[switchContainer]' + mode)
  this.parent.trigger('mode', mode)
};


/**
 * LocalStrings通したバリデーションメッセージ作成
 * @param {string} rule 'RULERUNITS' 全部大文字のルール
 * @param {string} type 'error','valid','warn'
 */
DM.getValidationMessage = function(rule, type) {
  return Strings['Pr_' + type.toUpperCase() + '_' + rule];
}


/**
* string を テンプレート用のobjectに変換
* UIテーマ(dark, light)を追加する
* http://hamalog.tumblr.com/post/4047826621/json-javascript
* @param {string} str
* @return {Object}
*/
DM.stringToObject = function(str) {
    var obj = (new Function("return " + str))();

    obj = _.extend({
        theme: themeManager.getThemeColorType(),
        Strings: Strings
     }, obj || {});

    return obj;
};
