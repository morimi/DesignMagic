/**
 * Measurement Protocol Reference
 * https://developers.google.com/analytics/devguides/collection/protocol/v1/reference?hl=ja
 */
riot.mixin('Analytics', {

  init: function () {    
    /**
     * @type {number}
     */
    this.count = 0;
  },
  
  /**
   * ユーザーIDを設定します。
   * @return {string} userId
   */
  setUserId: function () {
    var userId = this.createUserId();
    window.localStorage.setItem('com.cyberagent.designmagic:analytics.userId', userId);
    return userId;
  },
  
  /**
   * ユーザーIDを取得します。
   * @return {string} userId
   */
  getUserId: function () {
    return window.localStorage.getItem('com.cyberagent.designmagic:analytics.userId') || this.setUserId();
  },
  
  /**
   * ユニークIDを発行します。
   * @return {string} uuid
   */
  createUserId: function() {
    return require('node-uuid').v4();
  },
  
  /**
   * エクステンションの情報を返却する。
   * @return {Promise} Q.defer promise object
   */
  getExtensionInfo: function () {
    var fs = require('fs');
    var xml2js = require('xml2js');
    
    var extensionId = window.__adobe_cep__.getExtensionId();
    var extension = window.csInterface.getExtensions([extensionId])[0];
    
    var d = Q.defer();
    var parser = new xml2js.Parser();
    var data = fs.readFileSync(extension.basePath + '/CSXS/manifest.xml');
    parser.parseString(data, function (err, result) {
      // extension data を生成
      d.resolve({
          id: extensionId,
          name: extension.name,
          version: result.ExtensionManifest.ExtensionList[0].Extension[0].$.Version
      });
    });
    
    return d.promise;
  },
  
  /**
   * Photoshop のバージョンを返却する。
   * @return {string} appVersion
   */
  getPHXSVersion: function () {
    return window.csInterface.hostEnvironment.appVersion;
  },
  
  /**
   * Analytics 送信用のパラメータのデフォルト値を取得する。
   * @return {string} appVersion
   */
  defaultParams: function () {
    var me = this;
    var d = Q.defer();
    
    this.getExtensionInfo()
      .then(function (extension) {
        var params = {};
        _.defaultsDeep(params, {
          // プロトコルバージョン
          v: 1,
          // トラッキングID
          tid: 'UA-71660557-1',
          // クライアントID
          cid: 0,//me.getUserId(),
          // アプリのバージョン
          av: extension.version,
          // アプリの名称
          an: extension.name
        });
        d.resolve(params);
      });
      
    return d.promise;
  },
  
  /**
   * クエリストリングを生成する。
   * @param {Object} params 変換するデータ
   * @return {string} querystring
   */
  querystring: function (params) {
    var query = '';
    for (var key in params) {
      query += key + '=' + params[key] + '&'
    }
    query = query.substr( 0 , (query.length-1) );
    return query;
  },
  
  /**
   * バリデーションの実行回数のカウントアップ
   */
  addCount: function () {
    this.count++;
  },
  
  /**
   * バリデーションの実行回数を取得する
   * @return {number} バリデーションの実行回数
   */
  getCount: function () {
    return this.count;
  },
  
  /**
   * バリデーションの実行回数のログをクリアする。
   */
  clearCount: function () {
    this.count = 0;
  },
    
  /**
   * ログを送信する
   */
  report: function () {
    var me = this;
    
    // キャッシュ対策
    // me.params.z = Date.now();
    this.send({
      // 種別
      t: 'event',
      // イベント カテゴリ
      ec: 'App',
      // イベント アクション
      ea: 'Aggregate',
      // バリデーション実行回数の総数
      el: me.getCount()
    })
    .then(function () {
      me.clearCount();
    });
  },
  
  /**
   * Google Analytics に送信します。
   * @param {string} params Analytics への送信用パラメータ
   * @return {Promise} Q.defer promise object
   */
  send: function (params) {
    var me = this;
    var d = Q.defer();
    
    this.defaultParams()
      .then(function (data) {
        params = _.merge(params, data);
    
        // url(https): 'https://ssl.google-analytics.com/collect'
        var url = 'http://www.google-analytics.com/collect' + '?' + me.querystring(params);
        
        var handleSendLog = function (res) {
          if (res.statusCode == '200') {
            res.setEncoding('utf8');
            res.on('data', function (data) {
              console.log('[analytics.send] ' + url);
              d.resolve();
            });
          }
          if (res.statusCode == '403') {
            //
          }
        };
        http.get(url, handleSendLog);
      });
    
    return d.promise;
  }
    
});
