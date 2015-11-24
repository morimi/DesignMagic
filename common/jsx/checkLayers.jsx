/**
 * @fileoverview layerSets & artLayersの命名チェック
 */

try {

/**
 * @param {string} title
 * @param {Array} hint
 * @param {string} type
 * @param {string} kind LayerKind
 * @return {string} stringifyした文字列
 */
function resultToString(title, hint, type, kind) {
  //return JSON.stringify(this.data); JSON使えないよ

  var text = '{title:"' + title + '", hint:[';

  for ( var i = 0, l = hint.length; i < l; i++ ) {
    text += '"' + hint[i] + '"' + ',';
  }
  text = text.slice(0, -1); //末尾の , を切る
  text += '], type:"' + type + '",'
  text += 'kind: "' + kind + '",'
  text += '}';

  return  text;

};


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
 * レイヤー配列をextendするための入れ物
 * @type {Array.<Layers>}
 */
var layers = [];

/**
 * 命名チェックレベル毎の正規表現
 * 0 : レイヤー、グループ のコピー のみ
 * 1 : Lv0 + シェイプ
 * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
 */
var NAME_REGEX = {
  0 : new RegExp('<%= Strings.Pr_LAYER_NAME_REGEX_0 %>'),
  1 : new RegExp('<%= Strings.Pr_LAYER_NAME_REGEX_1 %>'),
  2 : new RegExp('<%= Strings.Pr_LAYER_NAME_REGEX_2 %>')
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
 * Layerのチェック
 * @param {Array.<Layer>} target activeDocument.layers
 * @return {void}
 */
function check(targets) {
  var i = 0, l = targets.length,
      nameRegex = NAME_REGEX["<%= config.layers.namingLevel %>"];

  while ( i < l ) {
    var target = targets[i],
        name = target.name,
        hint = [],
        type = VALIDATION_TYPE.WARN,
        kind = target.kind;


    //内容による分岐
    switch ( kind ) {

      //文字の場合
      case LayerKind.TEXT:

        if ( target.textItem.contents ) {
          //フォントサイズの整数を判定
          //zoomツールで拡大縮小するとこのプロパティの値が正しくない
          //一旦レイヤーを削除して作り直さないと正しい値に戻らない
          if ( /\./.test(target.textItem.size) && CONF_FONTS_ABSVALUE) {
            hint.push(VALIDATION_HINT.FONT_ABSVALUE);
          }

          if( target.textItem.size <  CONF_FONTS_MINSIZE) {
            hint.push(VALIDATION_HINT.FONT_MINSIZE);
          }
        } else {
          //内容がないよう
          hint.push(VALIDATION_HINT.FONT_EMPTY);
          type = VALIDATION_TYPE.ERROR;
        }

        break;

      default:

        //命名
        if ( nameRegex.test(name) && CONF_LAYERS_NAME) {
          hint.push(VALIDATION_HINT.NONAME);
        }

    }

    //ブレンドモード（LayerSet以外をチェック）
    //※LayerSetはデフォが通過のためエラーとして判断してしまうため
    if (target.typename !== 'LayerSet' && target.blendMode !== BlendMode.NORMAL && CONF_LAYERS_BLENDMODE) {
      hint.push(VALIDATION_HINT.BLENDMODE);
      type = VALIDATION_TYPE.ERROR;
    }

    //非表示レイヤーカウント
    h = (h + !target.visible)|0;

    if ( hint.length ) {
      mes.push(resultToString(name, hint, type, (kind || target.typename)));
    }

    i = (i+1)|0;
  }
}

/**
 * 現在のレイヤー構造体から平坦化した配列を返却
 * @return {Array.<Layer>}
 */
function getLayersList() {

  var list = [];

  function _traverse(layers) {
    var i = 0, l = layers.length;
    while ( i < l ) {
      var layer = layers[i];

      list.push(layer);

      if ( layer.typename === 'LayerSet' ) {
        _traverse(layer.layers);
      }

      i = (i+1)|0;
    }
  }

  _traverse(activeDocument.layers);

  return list;
}



if (documents.length !== 0 ) {

  layers = getLayersList();

  if ( layers.length ) {
    check(layers);
  }

  if ( mes.length ) {
    '{hidden: "' + h + '", list:[' + mes.join(',') + ']}';
  } else {
    '{hidden: "' + h + '", list:[]}';
  }
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
