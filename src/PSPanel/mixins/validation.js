/**
 * @fileoverview バリデーション機能を集約したミックスイン
 * 
 * カスタムイベント
 * validationEnd - チェック完了時に発火する。引数で結果オブジェクトを渡す
 *
 */

riot.mixin('Validation', { 
  /**
   * 単位
   * @const
   */
  UNITS_LABEL: {
    CM: 'cm',
    INCHES: 'inch',
    MM: 'mm',
    PERCENT: '%',
    PICAS: 'pica',
    POINTS: 'pt',
    PIXELS: 'px'
  },
  
  
  init: function() {
    
    /**
     * 結果
     */
    this.result = {
      errorVal: 0,
      warnVal: 0,
      hiddenVal: 0,
      lv: 0,
      time: null
    };
    
    /**
     * 処理中フラグ
     * @type {boolean}
     */
    this.prosessing = false;
    
    
    /**
     * check後のメッセージ総数
     */
    this.layersMesNum = 0;
    
    /**
     * checkLayersのメッセージ
     * @type {Array.<Object>}
     */
    this.layersMes = [];
    
    
    /**
     * checkLayers以外のメッセージ
     * @type {Array.<Object>}
     */
    this.othersMes = [];
    
    
    /** 
     * 結果文字列一時保存先
     */
    this.cache = {};

    /**
     * 結果文字列をObject変換したものをプールする
     */ 
    this.pool = {};
        
  },
  
  
  /**
   * 結果のリセット
   */
  reset: function() {
    
    this.result.errorVal = 0;
    this.result.warnVal = 0;
    this.result.hiddenVal = 0;
    this.result.lv = 0;
    this.result.time = null;

    this.layersMes.length = 0;
    this.othersMes.length = 0;
    this.layersMesNum = 0;
    
  },
  

  /**
   * バリデーション実行
   */
  check: function(config) {
    var me = this;

    //updateに紐づけてると無慈悲に実行されて無限ループするのでここで阻止する
    if ( this.prosessing ) {
      throw new Error('前回のチェックが終わっていません');
      return;
    }

    console.info('check start ٩(ˊᗜˋ*)و');
    
    this.reset();

    this.prosessing = true;

    var startTime = Date.now();

    Q.fcall(this.checkUnits, config)
     .then(this.checkDocumentMode)
     .done(function() {
      console.info('check completed ٩(ˊᗜˋ*)و');
      
      me.result.time = me.getExecTime(startTime);
      me.result.lv = me.calcGuilty(me.result);
      me.result.message = me.getResultMessage(me.result);
      
      me.trigger('validationEnd', me.result);
      //me.displayResult(start);
      me.update();
      
      me.prosessing = false;
    })
  },
  
  /**
   * 結果用メッセージを得る
   * @return {string}
   */
  getResultMessage: function(r) {
        
    if ( r.errorVal > 0 ) {
      //エラーの内容を確認してください
      return Strings.Pr_MESSAGE_CHECK_ERROR;
      
    } else if (r.warnVal > 0) {
      //いくつか注意点があるようです
      return Strings.Pr_MESSAGE_CHECK_WARN;
      
    } else {
      return Strings.Pr_MESSAGE_CHECK_SUCCESS;
    }
    
  },
  
  
  /**
   * 実行時間を計算して整形したものを返す
   * @return {string}
   */
  getExecTime: function(start) {
    return Math.abs((start - Date.now()) / 1000) + 's'
  },
  
  /**
   * エラーと注意の総数から罪の重さを量る
   * @return {number} 0 - 7 （罪の重さを8段階で返す）
   */
  calcGuilty: function(r) {
    var g = 0;

    if (( r.errorVal > 20 ) || ( r.warnVal > 120 )) g = 7;
    else if (( r.errorVal > 15 ) || ( r.warnVal > 90 )) g = 6;
    else if  (( r.errorVal > 10 ) || ( r.warnVal > 60 )) g = 5;
    else if  (( r.errorVal > 5 ) || ( r.warnVal > 30 )) g = 4;
    else if  (( r.errorVal > 1 ) || ( r.warnVal > 20 )) g = 3;
    else if  ( r.warnVal > 10 ) g = 2;
    else if  ( r.warnVal > 0 )  g = 1;

    return g;
  },
  
  /**
  * string を テンプレート用のobjectに変換する
  * UIテーマ(dark, light)を追加する
  * http://hamalog.tumblr.com/post/4047826621/json-javascript
  * @param {string} str
  * @return {Object}
  */
  stringToObject: function(str) {
      var obj = JSON.parse(str) || {};

      obj.theme = themeManager.getThemeColorType();

      return obj;
  },


  /**
   * エラー・注意のカウント
   * @param {{type: 'string'}}
   */
  countError: function(obj) {

    if ( obj.type == 'error' ) this.result.errorVal = this.result.errorVal + 1|0;
    if ( obj.type == 'warn' )  this.result.warnVal = this.result.warnVal + 1|0;
    //h = h+1|0;
  },
  
  /**
   * 結果の文字列をオブジェクト化して返す
   * 結果が同じ場合は保管してあるオブジェクトを返す
   */
  getResultObject: function(name, result) {
    var obj;
    
    //前回チェックと同じ結果である場合
    if ( this.cache[name] && this.cache[name] === result ) {
      obj = this.pool[name]; //プールから再利用
      
    } else { //結果が無いか違う場合は新規作成して保管
      delete this.cache[name];
      delete this.pool[name];
      
      obj = this.stringToObject(result);
      
      this.pool[name] = obj;
      this.cache[name] = result;
    }
    
    return obj;
  },


  /**
   * LocalStrings通したバリデーションメッセージ作成
   * @param {string} rule 'RULERUNITS' 全部大文字のルール
   * @param {string} type 'error','valid','warn'
   */
  getValidationMessage: function(rule, type) {
    return Strings['Pr_' + type.toUpperCase() + '_' + rule];
  },

  /**
   * 単位チェック
   * @param {Object} c config data object
   */
  checkUnits: function(c) {
    var me = this;
    var d = Q.defer();

    if (c.check.config.rulerUnits || c.check.config.typeUnits) {

      JSXRunner.runJSX("checkUnits", {config: c.check.config}, function (result) {

        var obj = me.getResultObject('checkUnits', result);
        
        if (obj.status === 200 && obj.list) {

          _.each(obj.list, function(r, i) {
            var label = me.UNITS_LABEL[ c.check.config[_.camelCase(r.name) + 'Type'] ],
                unit = me.UNITS_LABEL[r.value.replace(/(Units|TypeUnits)\./, '')];

            if ( r.type === 'error') {
              r.hint = [ Strings.formatStr(me.getValidationMessage(r.name, 'hint'), label) ];
            }

            r.title = Strings.formatStr(me.getValidationMessage(r.name, r.type), unit);

            me.countError(r);
            me.othersMes.push(r);

          });
        }


        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  },
  
  
  /**
   * ドキュメントモードのチェック
   * @param {Object} c config data object
   */
  checkDocumentMode: function(c) {
    var me = this;
    var d = Q.defer();
    
    if (c.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {

        var obj = me.getResultObject('checkDocumentMode', result);
        
        if (obj.status === 200) {
          obj.value = obj.value.replace("DocumentMode.","");

          if ( obj.type === 'error' ) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('DOCUMENTMODE', 'hint'), c.check.config.documentModeType)];
          }
          
          obj.title = Strings.formatStr(me.getValidationMessage('DOCUMENTMODE', obj.type), obj.value);

          me.countError(obj);
          me.othersMes.push(obj);

          d.resolve(c);

        } else {
          d.resolve(c);
        }
        
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  }
});