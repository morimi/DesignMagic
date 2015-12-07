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
function resultToString(id, title, hint, type, kind) {
  //return JSON.stringify(this.data); JSON使えないよ

  var text = '{id: ' + id + ', title:"' + title + '", hint:[';

  for ( var i = 0, l = hint.length; i < l; i++ ) {
    text += '"' + hint[i] + '"' + ',';
  }
  text = text.slice(0, -1); //末尾の , を切る
  text += '], type:"' + type + '",'
  text += 'kind: "' + kind + '",'
  text += '}';

  return  text;

};

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
 * テキストレイヤーの拡大率を得る
 * @param {string} direction 縦または横を指定 'yy' or 'xx'
 * @return {number} 拡大率
 * @see https://forums.adobe.com/thread/1954020
 */
function _getTextScale(direction, layer) {
  var ref = new ActionReference();
  ref.putIdentifier(charIDToTypeID('Lyr '), layer.id);

  var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));
  if (desc.hasKey(stringIDToTypeID('transform'))) {
    var transform = desc.getObjectValue(stringIDToTypeID('transform'));
    var mFactor = transform.getUnitDoubleValue (stringIDToTypeID(direction));
    return mFactor;
  }
  return 1;
}

/**
 * 拡大率を考慮したフォントサイズを得る（文字パネルと同じ値）
 * @param {Layer} layer テキストレイヤーオブジェクト
 * @return {number} フォントサイズ
 * @see https://forums.adobe.com/thread/1954020
 */
function getTextSize(layer) {

  var text_item = layer.textItem;
  var pixels = text_item.size.value;
  var scale = _getTextScale('yy', layer);

  return Math.round((pixels * scale) * 100) / 100;
}


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
        var textItem = target.textItem;

        if ( textItem.contents ) {

          try {

            var size = getTextSize(target);

            //フォントサイズの整数を判定
            //zoomツールで拡大縮小するとこのプロパティの値が正しくない
            //（textItem.sizeバグのため一旦レイヤーを削除して作り直さないと正しい値に戻らない）
            if ( /\./.test(size) && CONF_FONTS_ABSVALUE ) {

              hint.push(VALIDATION_HINT.FONT_ABSVALUE);
            }

            if( (size <  CONF_FONTS_MINSIZE) && (0 < CONF_FONTS_MINSIZE) ) {
              hint.push(VALIDATION_HINT.FONT_MINSIZE);
            }

          } catch(e) {
            //fontsize 12（初期設定）でテキストレイヤーを作った場合
            //textItem.sizeの値に何かが起きる模様（setterがバグってる？）
            //一度フォントサイズを操作すればエラーは出なくなるが、そのままだと
            //textItem.sizeとソースに書いただけで↓のエラーが出るため、tryで無かったことにする
            //INFO:CONSOLE(2)] "Uncaught SyntaxError: Unexpected token ILLEGAL"
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
      mes.push(resultToString(target.id, name, hint, type, (kind || target.typename)));
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

  activeDocument.activeLayer = SELECTED_LAYER;

  if ( mes.length ) {
    '{hidden: "' + h + '", list:[' + mes.join(',') + ']}';

  } else {
    '{hidden: "' + h + '", list:[]}';
  }


}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
