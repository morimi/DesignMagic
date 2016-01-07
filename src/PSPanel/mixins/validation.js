/**
 * @fileoverview バリデーション機能を集約したミックスイン
 * 
 * カスタムイベント
 * validationStart - チェック開始時に発火する。
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
      console.log('init validation.js')
    
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
  resetResult: function() {
    
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
  checkExecute: function(config) {
    var me = this;

    //updateに紐づけてると無慈悲に実行されて無限ループするのでここで阻止する
    if ( this.prosessing ) {
      throw new Error('前回のチェックが終わっていません');
      return;
    }

    console.info('check start ٩(ˊᗜˋ*)و');
    
    me.trigger('validationStart');
    
    this.resetResult();

    this.prosessing = true;

    var startTime = Date.now();

    Q.fcall(this.checkUnits, config)
     .then(this.checkDocumentMode)
     .then(this.checkFileName)
     .then(this.checkFileSize)
     //.then(this.checkLayerComps)
     .then(this.checkLayers)
     .done(function() {
      console.info('check completed ٩(ˊᗜˋ*)و');
      
      me.result.time = me.getExecTime(startTime);
      me.result.message = me.getResultMessage(me.result);
      
      me.trigger('validationEnd', me.result);
      
      me.update();
      
      me.prosessing = false;
    })
  },
  
  
  /**
   * 実行時間を計算して整形したものを返す
   * @return {string}
   */
  getExecTime: function(start) {
    return Math.abs((start - Date.now()) / 1000) + 's'
  },
  
  
  /**
   * 結果用メッセージを得る
   * @param {Object} r Result variable object
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
   * エラー・注意のカウントアップ
   * @param {{type: 'string'}} obj typeプロパティが含まれているオブジェクト
   */
  countUpError: function(obj) {
    if ( !obj.type ) return;
    if ( obj.type == 'error' ) this.result.errorVal = this.result.errorVal + 1|0;
    if ( obj.type == 'warn' )  this.result.warnVal = this.result.warnVal + 1|0;
    //h = h+1|0;
  },
  

  /**
   * エラー・注意のカウントダウン
   * @param {{type: 'string'}} obj typeプロパティが含まれているオブジェクト
   */
  countDownError: function(obj) {
    if ( !obj.type ) return;
    if ( obj.type == 'error' ) this.result.errorVal = this.result.errorVal - 1|0;
    if ( obj.type == 'warn' )  this.result.warnVal = this.result.warnVal - 1|0;
    //h = h+1|0;
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
   * 結果の文字列をオブジェクト化して返す
   * 結果が同じ場合は保管してあるオブジェクトを返す
   */
  getResultObject: function(name, result) {
    var obj;
    
    //レイヤーは物量多いのでスルー
    if ( name == 'checkLayers' ) {
      
      obj = this.stringToObject(result);
    
    //前回チェックと同じ結果である場合
    } else if ( this.cache[name] && this.cache[name] === result ) {
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

            me.countUpError(r);
            me.othersMes.push(r);
          });
        }


        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  }
  
  
  /**
   * ドキュメントモードのチェック
   * @param {Object} c config data object
   */
  ,checkDocumentMode: function(c) {
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

          me.countUpError(obj);
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
  
  /**
   * ファイル名チェック
   * @param {Object} c config data object
   */
  ,checkFileName: function(c) {
    var me = this;
    var d = Q.defer();

    if (_.isArray(c.check.files.name)) {
      JSXRunner.runJSX("checkFileName", {config: c.check.files}, function (result) {

        var obj = me.getResultObject('checkFileName', result);
        
        if (obj.status === 200) {

          obj.title = me.getValidationMessage('DOCUMENTNAME', obj.type);

          if ( obj.type === 'error' ) {
            obj.hint = [me.getValidationMessage('DOCUMENTNAME', 'hint')];
          }

          me.countUpError(obj);
          me.othersMes.push(obj);
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  }
  
  
  /**
   * ファイルサイズのチェック
   */
  ,checkFileSize: function(c) {
    var me = this;
    var d = Q.defer();

    if ( _.isNumber(c.check.files.size) ) {

      JSXRunner.runJSX("checkFileSize", {config: c.check.files}, function (result) {

        var obj = me.getResultObject('checkFileSize', result);
        
        if (obj.status === 200) {

          obj.title = Strings.formatStr(me.getValidationMessage('FILESIZE', obj.type), obj.value, obj.limit);

          if ( obj.type !== 'valid' ) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('FILESIZE', 'hint'), obj.value, obj.limit)];
          }

          me.countUpError(obj);
          me.othersMes.push(obj);

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
  ,checkLayerComps: function checkLayerComps(c) {
    var me = this;
    var d = Q.defer();

    if ( c.check.files.useLayerComps ) {

      JSXRunner.runJSX("checkLayerComps", {config: c.check.files}, function (result) {

        var obj = me.getResultObject('checkLayerComps', result);
        
        if (obj.status === 200) {

          obj.title = [Strings.formatStr(me.getValidationMessage('LAYERCOMPS', obj.type), obj.value)];


          if (obj.type === 'valid' && ! obj.value) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('LAYERCOMPS', 'select'), obj.value)];
          }

          me.countUpError(obj);
          me.othersMes.push(obj);
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
  ,checkDocumentRatio: function(c) {
    var me = this;
    var d = Q.defer();

    if ( c.check.files.ratio ) {

      JSXRunner.runJSX("checkDocumentRatio", {config: c.check.files}, function (result) {

        var obj = me.getResultObject('checkDocumentRatio', result);
        
        if (obj.status === 200) {
          var unit =  me.UNITS_LABEL[c.check.config.rulerUnitsType];
          obj.title = me.getValidationMessage('DOCUMENTRATIO', obj.type, obj.value);

          if ( obj.type === 'error') {
            obj.hint = [Strings.formatStr(me.getValidationMessage('DOCUMENTRATIO', 'hint'), (c.check.files.ratio * 320) + unit)];
          }

          me.countUpError(obj);
          me.othersMes.push(obj);
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
  ,checkLayers: function(c) {
    var me = this;
    var d = Q.defer();

    if ( _.isObject(c.check.layers) && _.isObject(c.check.fonts) ) {

      JSXRunner.runJSX("checkLayers", {config: c.check, Strings: Strings}, function (result) {

        var r = me.getResultObject('checkLayers', result);
        
        if ( ! r.list || r.value === 404 ) {
          return d.resolve(c);
        }
        
        if ( _.isArray(r.list) && r.list.length ) {
          var i = r.list.length-1;
          var minSize = c.check.fonts.minSize;
          var unitsLabel = me.UNITS_LABEL[c.check.config.rulserUnitsType];
          
          while( i > -1 ) {
            var obj = r.list[i];
            
            obj.hintCodes = obj.hint.join(',');
            obj.theme = r.theme;

            _.each(obj.hint, function(h, i) {
              switch(h) {
                case 'FONT_MINSIZE':
                  obj.hint[i] = {code: h,
                                 text: Strings.formatStr(me.getValidationMessage(h + '_LAYERS', 'hint'), minSize + unitsLabel)};
                  break;
                default:
                  obj.hint[i] = {code: h,
                                 text: me.getValidationMessage(h + '_LAYERS', 'hint')};
              }

            });

            me.countUpError(obj);
            me.layersMes.push(obj);
            
            i = (i-1)|0;
          }
        }
        
        me.result.hiddenVal = r.hidden;
        
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  }
});