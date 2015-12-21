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

    this.layersMes = [];
    this.othersMes = [];

    Q.fcall(this.parent.loadConfig)
     .then(this.checkUnits)
     .done(function() {
      console.log('check completed ٩(ˊᗜˋ*)و')
      me.update();
      me.displayResult(start);
    })
  },
  
  
  /**
   *
   * @param {{type: 'string'}}
   */
  countError: function(obj) {

    if ( obj.type == 'error' ) this.errorVal = this.errorVal + 1|0;
    if ( obj.type == 'warn' )  this.warnVal = this.warnVal + 1|0;
    //h = h+1|0;
  },
  
  
  /**
   * エラーと注意の総数から罪の重さを量る
   * @param {number} errorNum エラー総数
   * @param {number} warnNum 注意総数
   * @return {number} 0 - 7 （罪の重さを8段階で返す）
   */
  calcGuilty: function(errorNum, warnNum) {
    var g = 0;

    if (( this.errorNum > 20 ) || ( this.warnNum > 120 )) g = 7;
    else if (( this.errorNum > 15 ) || ( this.warnNum > 90 )) g = 6;
    else if  (( this.errorNum > 10 ) || ( this.warnNum > 60 )) g = 5;
    else if  (( this.errorNum > 5 ) || ( this.warnNum > 30 )) g = 4;
    else if  (( this.errorNum > 1 ) || ( this.warnNum > 20 )) g = 3;
    else if  ( this.warnNum > 10 ) g = 2;
    else if  ( this.warnNum > 0 )  g = 1;

    return g;
  },
  
    /**
   * エラー・注意総数の表示、コンソールの表示
   */
  displayResult: function(start){
    
    var console = {
      time: Math.abs((start - Date.now()) / 1000) + 's',
      lv: this.calcGuilty(this.errorNum, this.warnNum),
      message: null
    };

    if ( this.errorNum > 0 ) {
      //エラーの内容を確認してください
      console.message = Strings.Pr_MESSAGE_CHECK_ERROR;
    } else if (this.warnNum > 0) {
      //いくつか注意点があるようです
      console.message = Strings.Pr_MESSAGE_CHECK_WARN;
    } else {
      console.message = Strings.Pr_MESSAGE_CHECK_SUCCESS;
    }

    //エラーカウント
    this.parent.tags.header.update({ errorVal: this.errorVal, warnVal: this.warnVal});

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
   * @param {Object} config data object
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
   * @param {Object} config data object
   */
  checkDocumentMode: function (c) {
    var d = Q.defer();
    var me = this;
    
    if (c.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {

        var obj = me.stringToObject(result);
        if (_.isObject(obj) && obj.type) {

          if ( obj.type === 'error' ) {
            obj.hint = [Strings.formatStr(me.getValidationMessage('DOCUMENTMODE', 'hint'), label)];
          }
          
          r.title = Strings.formatStr(me.getValidationMessage('DOCUMENTMODE', obj.type), obj.value);
          r.value = obj.value.replace("DocumentMode.","");

          me.countError(r);
          me.othersMes.push(r);

          d.resolve(c);

        } else {
          d.reject(c);
        }
      });

    } else {

      d.resolve(c);

  }

    return d.promise;
  }   
})