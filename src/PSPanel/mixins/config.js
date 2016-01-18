riot.mixin('Config', {
  
  init: function() {

    
     /**
     * conf.jsonのキャッシュ
     * @type {?Object}
     */
    this.confCache = null;
    
    /**
     * ローカルで読み込んだファイルの一時格納場所
     * @type {?string}
     */
    this.localConfFile = null;

    /**
     * 基本設定項目 conf.json
     * @type {Object}
     */
    this.conf = require("../conf.json");
    

  },
  
  /**
   * conf.jsonのテキストをObjectに変換
   * ついでにテンプレート用の'theme'と'Strings'も追加する
   * @param {string} dataStr conf.jsonの中身
   * @param {string} url data.urlに追加する文字列
   * @param {Object} conf.jsonのオブジェクト
   */
  
  parseData: function(dataStr, url) {
    var data = JSON.parse(dataStr);
    data = _.defaultsDeep(data, this.conf);
    data.url = url;

    return data;
  },
  

 /**
  * 設定ファイルを取得する
  * @return {Promise} Q.defer promise object
  */
  loadConfig : function() {

    console.info('[localConfig] start method...');
    
    var me = this;
    var d = Q.defer();
    var url = window.localStorage.getItem('com.cyberagent.designmagic:conf.url');
    var localData = window.localStorage.getItem('com.cyberagent.designmagic:conf.result');
    
    //urlもローカルファイルもない
    if ( (!url && localData && !this.localConfFile)
          || ( !url && !localData )
       ) {
      
      console.info('[loadConfig] URL and local file was not found.');
      me.trigger('message', Strings.Pr_MESSAGE_NOT_SETTING_FILE);
      d.resolve(null);

    //キャッシュあった
    } else if ( this.confCache && this.confCache.url === url ) {

      console.info('[loadConfig] config.json of the cache was found.');
      d.resolve(this.confCache);

    //ローカルストレージに保存されてた
    } else if ( localData && (url === 'localhost') ) {
      
      console.info('[loadConfig] conf.json data was found in the localStorage.');
      me.trigger('message', Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);
      
      this.confCache = this.parseData(localData, 'localhost');
      
      d.resolve(this.confCache);

    //ローカルファイルが指定された
    } else if ( this.localConfFile && this.localConfFile.type === 'application/json' ) {

      console.info('[loadConfig] Loading local conf.json file data');

      return this.loadLocalConfig();

    //リモートのファイルが指定された
    } else {

      console.info('[loadConfig] Loading remote conf.json ....' + url, localData);

      return this.loadRemoteConfig(url);
    }

    return d.promise;

  },
  
  /**
   * リモートのconf.jsonをとりにいく
   * 取れたら中身をオブジェクトに変換してvm.confCacheにセットする。
   * 取れなかった場合はconfを代用してセットする。
   * @param {string} url Request url
   * @return {Promise} Q.defer promise object
   */
  loadRemoteConfig: function(url) {
    var d = Q.defer();
    var me = this, req;

    /**
     * @param {XMLHttpRequest} xhr
     */
    var handleLoadConfigError = function(xhr) {

      if ( xhr && xhr.status >= 300) {
        me.trigger('message', Strings.Pr_MESSAGE_USE_DEFAULT_CONFIG);
        me.confCache = me.conf;
      }

    };
    
    var handleLoadConfigSuccess = function (res) {

      if (res.statusCode == '200') {
        res.setEncoding('utf8');
        res.on('data', function (data) {
          data = JSON.parse(data);

          data = _.defaultsDeep(data, me.conf);
          data.url = url;
          me.confCache = data;

          me.trigger('message', Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);

          d.resolve(data);
        });
      }

      if (res.statusCode == '403') {
        handleLoadConfigError();
        d.resolve(me.confCache);
      }
    };
    
    if ( url.indexOf('https') === -1 ) {
      
      req = http.get(url, handleLoadConfigSuccess);
      
    } else {
      
      req = https.get(url, handleLoadConfigSuccess);

    }

    req.on('error', function() {
      handleLoadConfigError();
      d.resolve(me.confCache);
    });

    return d.promise;

  },
  

  /**
   * ローカルのconfファイルを読み込む
   * 成功したらconfCacheにセットする
   * 失敗した場合はconfを代用してセットする。
   * @return {Promise} Q.defer promise object
   */
  loadLocalConfig: function () {
    var me = this;
    var d = Q.defer();
    var reader = new FileReader();

    reader.onload = function(e) {

      switch (e.target.readyState) {

        case FileReader.DONE : // DONE == 2
          var result = e.target.result;
          var data = JSON.parse(result);

          window.localStorage.setItem('com.cyberagent.designmagic:conf.url', 'localhost');
          window.localStorage.setItem('com.cyberagent.designmagic:conf.result', result);

          data = _.defaultsDeep(data, me.conf);
          data.url = 'localhost';

          me.confCache = data;
          me.localConfFile = null;
          me.trigger('message', Strings.Pr_MESSAGE_SUCCES_LOAD_CONFIG_FILE);
          
          d.resolve(data);
        break;

      }
    };

    reader.onerror = function() {
      me.confCache = me.conf;
      me.trigger('message', Strings.Pr_MESSAGE_USE_DEFAULT_CONFIG);
      d.resolve(data);
    };

    reader.readAsText(this.localConfFile);

    return d.promise;

  }

  
});