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
    
    this.layersMes = [];
    this.othersMes = [];

    this.mixin('Console');
  },

  check: function() {
    var me = this;
    var start = Date.now();
    this.errorVal = 0;
    this.warnVal = 0;
    this.hiddenVal = 0;

    this.layersMes = [];
    this.othersMes = [];

    Q.fcall(this.parent.loadConfig)
     .then(this.checkUnits)
     .then(this.checkDocumentMode)
     .then(this.checkFileName)
     .then(this.checkFileSize)
     .then(this.checkLayerComps)
     .then(this.checkDocumentRatio)
     .then(this.checkLayers)
     .done(function() {
      console.log('check completed ٩(ˊᗜˋ*)و', me.layersMes)
      me.displayResult(start);
      me.update();
    })
  },
  
  
  /**
   * エラー・注意のカウント
   * @param {{type: 'string'}}
   */
  countError: function(obj) {

    if ( obj.type == 'error' ) this.errorVal = this.errorVal + 1|0;
    if ( obj.type == 'warn' )  this.warnVal = this.warnVal + 1|0;
    //h = h+1|0;
  },
  
  
  /**
   * エラーと注意の総数から罪の重さを量る
   * @return {number} 0 - 7 （罪の重さを8段階で返す）
   */
  calcGuilty: function() {
    var g = 0;
    console.log(this.errorVal, this.warnVal)

    if (( this.errorVal > 20 ) || ( this.warnVal > 120 )) g = 7;
    else if (( this.errorVal > 15 ) || ( this.warnVal > 90 )) g = 6;
    else if  (( this.errorVal > 10 ) || ( this.warnVal > 60 )) g = 5;
    else if  (( this.errorVal > 5 ) || ( this.warnVal > 30 )) g = 4;
    else if  (( this.errorVal > 1 ) || ( this.warnVal > 20 )) g = 3;
    else if  ( this.warnVal > 10 ) g = 2;
    else if  ( this.warnVal > 0 )  g = 1;

    return g;
  },
  
  /**
   * エラー・注意総数の表示、コンソールの表示
   */
  displayResult: function(start){
    var console = {
      time: Math.abs((start - Date.now()) / 1000) + 's',
      lv: this.calcGuilty(),
      message: null
    };

    if ( this.errorVal > 0 ) {
      //エラーの内容を確認してください
      console.message = Strings.Pr_MESSAGE_CHECK_ERROR;
    } else if (this.warnVal > 0) {
      //いくつか注意点があるようです
      console.message = Strings.Pr_MESSAGE_CHECK_WARN;
    } else {
      console.message = Strings.Pr_MESSAGE_CHECK_SUCCESS;
    }

    //エラーカウント
    this.parent.tags.header.update({ errorVal: this.errorVal, warnVal: this.warnVal, hiddenVal: this.hiddenVal});

    this.setConsole(console);
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
  * string を テンプレート用のobjectに変換
  * UIテーマ(dark, light)を追加する
  * http://hamalog.tumblr.com/post/4047826621/json-javascript
  * @param {string} str
  * @return {Object}
  */
  stringToObject: function(str) {
      var obj = (new Function("return " + str))();

//        obj = _.extend({
//            theme: themeManager.getThemeColorType()
//         }, obj || {});

      return obj;
  },

  /**
   * 単位チェック
   * @param {Object} c config data object
   */
  checkUnits: function(c) {
      var d = Q.defer();
      var me = this;

      if (c.check.config.rulerUnits || c.check.config.typeUnits) {

        JSXRunner.runJSX("checkUnits", {config: c.check.config}, function (result) {

          var obj = me.stringToObject(result);

          if (_.isObject(obj) && obj.list.length) {

            _.each(obj.list, function(r, i) {
              var name = _.camelCase(r.name);
              var label =  me.UNITS_LABEL[c.check.config[name + 'Type']],
                  unit = me.UNITS_LABEL[r.value.replace(/(Units|TypeUnits)\./, '')];

              if ( r.type === 'error') {
                r.hint = [ Strings.formatStr(me.getValidationMessage(r.name, 'hint'), label) ];
              }
              
              r.title = Strings.formatStr(me.getValidationMessage(r.name, r.type), unit);

              me.countError(r);
              me.othersMes.push(r)

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
  checkDocumentMode: function (c) {
    var d = Q.defer();
    var me = this;
    
    if (c.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {

        var obj = me.stringToObject(result);
        
        if (obj.type && obj.value != "404") {

          if ( obj.type === 'error' ) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('DOCUMENTMODE', 'hint'), label)];
          }
          
          obj.value = obj.value.replace("DocumentMode.","");
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
  },
  

  /**
   * ファイル名チェック
   * @param {Object} c config data object
   */
  checkFileName: function(c) {
    var me = this;
    var d = Q.defer();

    if (_.isArray(c.check.files.name)) {
      JSXRunner.runJSX("checkFileName", {config: c.check.files}, function (result) {

        var obj = me.stringToObject(result);
        if (_.isObject(obj) && obj.type ) {

          obj.title = me.getValidationMessage('DOCUMENTNAME', obj.type);

          if ( obj.type === 'error' ) {
            obj.hint = [me.getValidationMessage('DOCUMENTNAME', 'hint')];
          }

          me.countError(obj);
          me.othersMes.push(obj);
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  },
  
  /**
   * ファイルサイズのチェック
   */
  checkFileSize: function(c) {
    var me = this;
    var d = Q.defer();

    if ( _.isNumber(c.check.files.size) ) {

      JSXRunner.runJSX("checkFileSize", {config: c.check.files}, function (result) {

        var obj = me.stringToObject(result);
        if (_.isObject(obj) && obj.type) {

          obj.title = Strings.formatStr(me.getValidationMessage('FILESIZE', obj.type), obj.value, obj.limit);

          if ( obj.type !== 'valid' ) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('FILESIZE', 'hint'), obj.value, obj.limit)];
          }

          me.countError(obj);
          me.othersMes.push(obj);

        }

        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  },
  
    /**
   * レイヤーカンプのチェック
   */
  checkLayerComps: function(c) {
    var me = this;
    var d = Q.defer();

    if ( c.check.files.useLayerComps ) {

      JSXRunner.runJSX("checkLayerComps", {config: c.check.files}, function (result) {

        var obj = me.stringToObject(result);
        if (_.isObject(obj)) {
          var value = parseInt(obj.value);

          obj.title = [Strings.formatStr(me.getValidationMessage('LAYERCOMPS', obj.type), obj.value)];


          if (obj.type === 'valid' && !value) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('LAYERCOMPS', 'select'), obj.value)];
          }

          me.countError(obj);
          me.othersMes.push(obj);
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  },
  
    /**
   * Ratioのチェック
   */
  checkDocumentRatio: function(c) {
    var me = this;
    var d = Q.defer();

    if ( c.check.files.ratio ) {

      JSXRunner.runJSX("checkDocumentRatio", {config: c.check.files}, function (result) {

        var obj = me.stringToObject(result);
        if (_.isObject(obj) && obj.type ) {
          var unit =  me.UNITS_LABEL[c.check.config.rulerUnitsType];
          obj.title = me.getValidationMessage('DOCUMENTRATIO', obj.type, obj.value);

          if ( obj.type === 'error') {
            obj.hint = [Strings.formatStr(me.getValidationMessage('DOCUMENTRATIO', 'hint'), (c.check.files.ratio * 320) + unit)];
          }

          me.countError(obj);
          me.othersMes.push(obj);
        }
        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;
  },
  
  /**
   * レイヤーのチェック
   */
  checkLayers: function(c) {
    var me = this;
    var d = Q.defer();

    if ( _.isObject(c.check.layers) && _.isObject(c.check.fonts) ) {

      JSXRunner.runJSX("checkLayers", {config: c.check, Strings: Strings}, function (result) {

        var r = me.stringToObject(result);

        if ( _.isArray(r.list) && r.list.length ) {
          _.each(r.list, function(obj) {
            obj.theme = r.theme;
            obj.hintCodes = obj.hint.join(',');

            _.each(obj.hint, function(h, i) {
              switch(h) {
                case 'FONT_MINSIZE':
                  obj.hint[i] = Strings.formatStr(me.getValidationMessage(h + '_LAYERS', 'hint'), c.check.fonts.minSize + me.UNITS_LABEL[c.check.config.rulserUnitsType]);
                  break;
                default:
                  obj.hint[i] = me.getValidationMessage(h + '_LAYERS', 'hint');
              }

            });

            me.countError(obj);
            me.layersMes.push(obj);
          });
        }

        me.hiddenVal = r.hidden;

        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  }
  
})