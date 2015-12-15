/**
 * @fileoverview Design Magic main.js (MithrilJS ver)
 *
 */
(function () {

  var csInterface = new CSInterface();

  //Modules
  var Handlebars  = require("handlebars"),
      _           = require("lodash"),
      Q           = require("Q"),
      http        = require('http'),
      JSXRunner   = require("../common/JSXRunner"),
      Strings     = require("./js/LocStrings");

  //DesignMagic Compornent
  var DM = {};

  /**
   * extension id (com.cyberagent.designmagic)
   * @type {string}
   */
  DM.extensionId =  csInterface.getExtensionID();

  /**
   * 基本設定項目 conf.json
   * @type {Object}
   */
  DM.conf = require("../conf.json");

  /**
   * ローカルで読み込んだファイルの一時格納場所
   * @type {?string}
   */
  DM.localConfFile = null;


  /**
   * TypeUnits, RulerUnits用ラベル
   * @type {{string:string}}
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
   * 設定ファイルを取得する
   * @return {Promise} Q.defer promise object
   */
  DM.loadConfig = function() {
    var d = Q.defer();
    var url = window.localStorage.getItem('com.cyberagent.designmagic:conf.url');
    var localData = window.localStorage.getItem('com.cyberagent.designmagic:conf.result');

    var parseData = function(dataStr, url) {
      var data = JSON.parse(dataStr);
      data = _.defaultsDeep(data, DM.conf);
      data.url = url;

      data = _.extend({
          theme: themeManager.getThemeColorType(),
          Strings: Strings
       }, data );

      DM.vm.confCache(data);

      return data;
    };

    DM.vm.consoleText('conf.jsonを読み込みます');

    //urlもローカルファイルもない
    if (!url && localData && !DM.localConfFile ) {

      DM.vm.consoleText(Strings.Pr_MESSAGE_NOT_SETTING_FILE);
      d.resolve(null);

    //キャッシュあった
    } else if ( DM.vm.confCache() && DM.confCache.url === url ) {

      console.info('[loadConfig]Find local conf.json cache');
      d.resolve(DM.vm.confCache());

    //ストレージに保存されてた
    } else if ( localData && (url === 'localhost') ) {

      var data = parseData(localData, 'localhost');
      DM.vm.consoleText(Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);

      d.resolve(data);

    //ローカルファイルが指定された
    } else if ( (DM.localConfFile && DM.localConfFile.type === 'application/json') ) {

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
   * @param {string} url Request url
   * @return {Promise} Q.defer promise object
   */
  DM.loadRemoteConfig = function(url) {
    var d = Q.defer();

    /**
     * @param {XMLHttpRequest} xhr
     */
    var checkHttpStatus = function(xhr) {

      if ( xhr.status >= 300) {
        DM.vm.consoleText(Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);
        DM.vm.confCache(me.conf);
        return JSON.stringify(xhr.responseText);
      }

      return xhr.responseText;

    };

    m.request({
      method: 'GET',
      url: url,
      background: true,
      extract: checkHttpStatus
    }).then(function(data) {
      data = _.defaultsDeep(data, DM.conf);
      data.url = url;
      data = _.extend({
          theme: themeManager.getThemeColorType(),
          Strings: Strings
       }, data );
      DM.vm.confCache(data);

      DM.vm.consoleText(Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);
      d.resolve(data);
    });

    return d.promise;

  };

  /**
   * ローカルのconfファイルを読み込む
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

          data = _.defaultsDeep(data, DM.conf);
          data.url = 'localhost';
          data = _.extend({
            theme: themeManager.getThemeColorType(),
            Strings: Strings
          }, data );

          DM.vm.confCache(data);
          DM.vm.consoleText(Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);
          DM.localConfFile = null;

          d.resolve(data);
        break;

      }
    };

    reader.onerror = function() {
      DM.vm.consoleText(Strings.Pr_MESSAGE_USE_DEFAULT_CONFIG);
      DM.vm.confCache(DM.conf);
      d.resolve(DM.conf);
    };

    reader.readAsText(DM.localConfFile);

    return d.promise;

  };


  /********************************************************
   * Controller
   *******************************************************/
  DM.controller = function () {

    this.vm = DM.vm;

    themeManager.init();


    Q.fcall(DM.loadConfig)
     .done(function() {
      console.log('init', DM.vm.confCache())
      DM.vm.loading = false;
      m.redraw();
    });
  };


  /********************************************************
   * View
   *
   * @param {DM.controler} c
   * @return {Object}
   *******************************************************/
  DM.view = (function(c){

    var view = {};
    var conf = c.vm.confCache();

    /**
     * Header view
     * @type {function}
     * @return {Object}
     */
    view.header = function() {
      return m('header.panel-hd.panel-header',[
        m('img[src=images/icon/dark/error.png][width=14][height=14].icon'),
        m('span#error-total.hd-number', '0'),
        m('img[src=images/icon/dark/warn.png][width=14][height=14].icon'),
        m('span#warn-total.hd-number', '0'),
        m('img[src=images/icon/dark/eye.png][width=14][height=14].icon'),
        m('span#hidden-total.hd-number', '0'),
        m('div#status'),
        c.vm.loading ? m('img[src=images/icon/dark/loader.gif]#icon-loader') : '',
        m('div.topcoat-button.hd-btn', {onclick: c.vm.switchContainer}, 'Check'),
        m('div.topcoat-button.hd-btn', {onclick: c.vm.switchContainer}, 'Config'),
        m('div.topcoat-button.hd-btn', {onclick: c.vm.switchContainer}, 'Tools')
      ]);
    };

    /**
     * Footer view
     * @type {function}
     * @return {Object}
     */
    view.footer = function() {
      return m('footer.panel-hd.panel-footer', [
        m('div#console', c.vm.consoleText() )
      ]);
    };

    /**
     * Validation view
     * @type {function}
     * @return {Object}
     */
    view.validation = function() {

      if (c.vm.mode !== 'check') {
        return;
      }

      return m('div#validation.container', [
        m('div#message-layers.list'),
        m('div#message-others.list', [
           view.info()
        ])
      ]);
    };


    view.info = function() {
      return m('li.validation-info', [
        (conf && conf.name) ? m('p', Strings.Pr_READY_TO_VALIDATION) :
          m('p', Strings.Pr_SETTING_TO_URL)
      ])
    };

    /**
     * Config view
     * @type {function}
     * @return {Object}
     */
    view.config = function() {

      if (c.vm.mode !== 'config' || !conf) {
        return;
      }

      return m('div#config.container', [
        m('div#config-list.list', [
          m('table.config-base', [
            m('caption', Strings.Pr_TITLE_BASEINFO),
            m('tr', [
              m('th[scope="row"]', Strings.Pr_CONFIG_NAME),
              m('td', conf.name)
            ])
          ])
        ])
      ]);
    };

    /**
     * Tools View
     * @type {function}
     * @return {Object}
     */
    view.tools = function() {

      if (c.vm.mode !== 'tools') {
        return;
      }

      return m('div#tools.container');

    };


    /**
     * Main View
     */
    return m('div#content', [
      view.header(),
      view.validation(),
      view.config(),
      view.tools(),
      view.footer()
    ]);

  });

  /********************************************************
   * view model
   * @return {Object}
   *******************************************************/

  DM.vm = {

    /**
     * conf.jsonのキャッシュ
     * @type {?Object}
     */
    confCache : m.prop(null),

    /**
     * #consoleに出力する内容
     */
    consoleText: m.prop(),

    /**
     * loader.gifの表示トリガー
     * @type {boolean}
     */
    loading: true,

    /**
     *
     */
    mode: 'check',

    /**
     *
     */
    switchContainer : function() {
      var mode = this.innerHTML.toLowerCase();
      console.log('[switchContainer]' + mode);
      DM.vm.mode = mode;
      m.redraw();
    }

  };


  m.mount(document.getElementById('main'), DM);

})();
