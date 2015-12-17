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
 * ViewModel
 */
var ViewModel = function() {

  //make observable
  riot.observable(this);

  /**
   * 基本設定項目 conf.json
   * @type {Object}
   */
  this.conf = require("../conf.json");

  /**
   * ローカルで読み込んだファイルの一時格納場所
   * @type {?string}
   */
  this.localConfFile = null;

   /**
   * conf.jsonのキャッシュ
   * @type {?Object}
   */
  this.confCache = null;

  /**
   * #consoleに出力する内容
   */
  this.consoleText  = null;


  /**
   * loader.gifの表示トリガー
   * @type {boolean}
   */
  this.loading = true

};

/**
 * DesignMagic
 */

window.DM = {};

/**
 * <validation>のmount時に実行
 * conf.jsonの読み込み
 */
DM.init = function() {

  themeManager.init();

  Q.fcall(DM.loadConfig)
   .done(function() {
    DM.vm.loading = false;
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
    data = _.defaultsDeep(data, DM.vm.conf);
    data.url = url;

    data = _.extend({
        theme: themeManager.getThemeColorType(),
        Strings: Strings
     }, data );

    DM.vm.confCache(data);

    return data;
  };

  //urlもローカルファイルもない
  if (!url && localData && !DM.vm.localConfFile ) {

    DM.vm.consoleText = Strings.Pr_MESSAGE_NOT_SETTING_FILE;
    d.resolve(null);

  //キャッシュあった
  } else if ( DM.vm.confCache && DM.vm.confCache.url === url ) {

    console.info('[loadConfig]Find local conf.json cache');
    d.resolve(DM.vm.confCache);

  //ストレージに保存されてた
  } else if ( localData && (url === 'localhost') ) {

    var data = parseData(localData, 'localhost');
    DM.vm.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;

    d.resolve(data);

  //ローカルファイルが指定された
  } else if ( (DM.vm.localConfFile && DM.vm.localConfFile.type === 'application/json') ) {

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
      DM.vm.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;
      DM.vm.confCache = DM.vm.conf;
    }

  };

  var req = http.get(url, function (res) {

    if (res.statusCode == '200') {
      res.setEncoding('utf8');
      res.on('data', function (data) {
        data = JSON.parse(data);
        data = _.defaultsDeep(data, DM.vm.conf);
        data = _.extend({
          url: url,
          theme: themeManager.getThemeColorType(),
          Strings: Strings
        }, data );
        DM.vm.confCache = data;

        DM.vm.trigger('confCache', data);

        DM.vm.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;
        d.resolve(data);
      });
    }

    if (res.statusCode == '403') {
      handleLoadConfigError();
      d.resolve(DM.vm.confCache);
    }
  });


  req.on('error', function() {
    handleLoadConfigError();
    d.resolve(DM.vm.confCache);
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

        data = _.defaultsDeep(data, DM.vm.conf);
        data = _.extend({
          url: 'localhost',
          theme: themeManager.getThemeColorType(),
          Strings: Strings
        }, data );

        DM.vm.confCache = data;
        DM.vm.consoleText = Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE;
        DM.vm.localConfFile = null;

        d.resolve(data);
      break;

    }
  };

  reader.onerror = function() {
    DM.vm.consoleText = Strings.Pr_MESSAGE_USE_DEFAULT_CONFIG;
    DM.vm.confCache = self.conf;
    d.resolve(DM.vm.conf);
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


