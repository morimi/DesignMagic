/**
 * @fileoverview layerSets & artLayersの命名チェック (ActionReference版)
 */

(function() {
  
  try {
    
    var SELECTED_LAYER = activeDocument.activeLayer;

    /**
     * メッセージ用コード
     */
    var VALIDATION_HINT = {
      NONAME : "NONAME",
      BLENDMODE: "BLENDMODE",
      FONT_ABSVALUE: "FONT_ABSVALUE",
      FONT_MINSIZE : "FONT_MINSIZE",
      FONT_EMPTY : "FONT_EMPTY"
    };

    /**
     * タイプ
     */
    var VALIDATION_TYPE = {
      WARN: "warn",
      ERROR: "error"
    };

    /**
     * エラーメッセージ文字列格納用
     * @type {Array.<string>}
     */
    var mes = [];


    /**
     * 命名チェックレベル毎の正規表現
     * 0 : レイヤー、グループ のコピー のみ
     * 1 : Lv0 + シェイプ
     * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
     */
    var NAME_REGEX = {
      0 : /<%= Strings.Pr_LAYER_NAME_REGEX_0 %>/,
      1 : /<%= Strings.Pr_LAYER_NAME_REGEX_1 %>/,
      2 : /<%= Strings.Pr_LAYER_NAME_REGEX_2 %>/
    };


    /**
     * Hidden Layer Count
     */
    var h = 0;

    /**
     * 設定の値
     */
        //命名 (boolean -> string)
    var CONF_LAYERS_NAME = "<%= config.layers.name %>" === 'true',
        //ブレンドモード (boolean -> string)
        CONF_LAYERS_BLENDMODE = "<%= config.layers.blendingMode %>" === 'true',
        //フォントサイズが整数かどうかチェックする (boolean -> string)
        CONF_FONTS_ABSVALUE = "<%= config.fonts.absValue %>" === 'true',
        //最小サイズ (number)
        CONF_FONTS_MINSIZE = parseInt("<%= config.fonts.minSize %>");

    /**
     *
     */
    var RULERUNITS = {
      'Units.CM': 'cm',
      'Units.INCHES': 'inch',
      'Units.MM': 'mm',
      'Units.PERCENT': '%',
      'Units.PICAS': 'pica',
      'Units.POINTS': 'pt',
      'Units.PIXELS': 'px'
    };

    /**
     * @requires checkLayers
     * @param {string} title レイヤー名
     * @param {Array} hint ヒント
     * @param {string} type メッセージタイプ
     * @param {string} kind LayerKind
     * @param {boolean} isVisible 表示状態
     * @return {string} stringifyした文字列
     */
    function resultToString(id, index, title, hint, type, kind, isVisible) {
      //return JSON.stringify(this.data); JSON使えないよ

      var text = '{"id": ' + id + ', "index": ' + index + ', "title":"' + title + '", "hint":[';

      for ( var i = 0, l = hint.length; i < l; i++ ) {
        text += '"' + hint[i] + '"' + ',';
      }
      text = text.slice(0, -1); //末尾の , を切る
      text += '], "type":"' + type + '",'
      text += '"kind": "' + kind + '",'
      text += '"visible": "' + (isVisible ? 'show' : 'hidden') + '"'
      text += '}';

      return  text;

    };


    if (documents.length !== 0 ) {

      var i = 1,
          l = DM.getNumberOfLayers(),
          nameRegex = NAME_REGEX["<%= config.layers.namingLevel %>"];

      while ( i <= l ) {
        var hint = [];
        var type = VALIDATION_TYPE.WARN;
        var ref2 = new ActionReference();
            ref2.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref2);
        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var isBackground = desc.getBoolean(stringIDToTypeID("background"));

        // if not layer group collect values;
        if ( layerSet != "layerSectionEnd" ) {
          var name = desc.getString(stringIDToTypeID('name'));
          var id = desc.getInteger(stringIDToTypeID('layerID'));
          var kind = desc.getInteger(stringIDToTypeID("layerKind"));
          var blendMode = typeIDToStringID(desc.getEnumerationValue( stringIDToTypeID( 'mode' )));
          var kindObj = DM.getLayerKind(desc);
          var isVisible = desc.getBoolean(stringIDToTypeID('visible'));

          switch ( kind ) {
              case 3: //text
                var textDesc = desc.getObjectValue(stringIDToTypeID('textKey'));
                var textContent = textDesc.getString(stringIDToTypeID("textKey"));

                if ( !textContent.length ) {
                  //内容がないよう
                  hint.push(VALIDATION_HINT.FONT_EMPTY);
                  type = VALIDATION_TYPE.ERROR;

                } else {

                  var textSize = DM.getTextSize(textDesc);

                  //フォントサイズの整数を判定
                  if ( /\./.test(textSize) && CONF_FONTS_ABSVALUE ) {
                    hint.push(VALIDATION_HINT.FONT_ABSVALUE);
                  }

                  //最小フォンとサイズ
                  if( (textSize <  CONF_FONTS_MINSIZE) && (0 < CONF_FONTS_MINSIZE) ) {
                    hint.push(VALIDATION_HINT.FONT_MINSIZE);
                  }
                }

              break;

            default:

              //命名
              if ( nameRegex.test(name) && CONF_LAYERS_NAME) {
                hint.push(VALIDATION_HINT.NONAME);
              }

              break;

          }//switch


          //ブレンドモード（LayerSet以外をチェック）
          //※LayerSetはデフォが通過のためエラーとして判断してしまうため
          if ( blendMode !== 'passThrough' && blendMode!== 'normal' && CONF_LAYERS_BLENDMODE) {
            hint.push(VALIDATION_HINT.BLENDMODE);
            type = VALIDATION_TYPE.ERROR;
          }


          //非表示レイヤーカウント
          h = (h + !isVisible)|0;

          if ( hint.length ) {
            mes.push(resultToString(id, i, name, hint, type, kindObj, isVisible));
          }

        }//if

        i = (i+1)|0;

      } //while

      if ( mes.length ) {
        return '{"hidden": ' + h + ', "list":[' + mes.join(',') + '], "status": 200}';

      } else {
        return '{"hidden": ' + h + ', "list":[], "status": 200}';
      }

    } else {
      return '{"status": 404}';
    }//if

  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }
}());