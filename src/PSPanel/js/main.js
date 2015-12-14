/**
 * @fileoverview Design Magic main.js (MithrilJS ver)
 *
 */
(function () {

  var csInterface = new CSInterface();


  //DesignMagic Compornent
  var DM = {};

  /**
   * extension id (com.cyberagent.designmagic)
   * @type {string}
   */
  DM.extensionId =  csInterface.getExtensionID();

  /**
   * conf.jsonのキャッシュ
   * @type {?Object}
   */
  DM.confCache = null;

  /**
   * ローカルで読み込んだファイルの一時格納場所
   * @type {?string}
   */
  DM.localConfFile = null;


  /**
   * TypeUnits, RulerUnits用ラベル
   * @type {{string:string}}
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


  /********************************************************
   * Controller
   *******************************************************/
  DM.controller = function () {
    themeManager.init();
  };


  /********************************************************
   * view
   * @type {function}
   * @return {Object}
   *******************************************************/
  DM.view = (function(){

    var view = {};

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
        m('img[src=images/icon/dark/loader.gif]#icon-loader'),
        m('div.topcoat-button.hd-btn', 'Check'),
        m('div.topcoat-button.hd-btn', 'Config'),
        m('div.topcoat-button.hd-btn', 'Tools')
      ]);
    };

    /**
     * Footer view
     * @type {function}
     * @return {Object}
     */
    view.footer = function() {
      return m('footer.panel-hd.panel-footer', [
        m('div#console')
      ]);
    };

    return m('div#content', [
      view.header(),
      m('div#validation.container', [
        m('div#message-layers.list'),
        m('div#message-others.list')
      ]),
      m('div#config.container'),
      m('div#tools.container'),
      view.footer()
    ]);

  });


  m.mount(document.getElementById('main'), DM);


})();
