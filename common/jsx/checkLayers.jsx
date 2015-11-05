/**
 * @fileoverview layerSets & artLayersの命名チェック
 */

try {

/**
 * @param {string} title
 * @param {Array} hint
 * @param {string} type
 * @return {string} stringifyした文字列
 */
function resultToString(title, hint, type) {
  //return JSON.stringify(this.data); JSON使えないよ

  var text = '{title:"' + title + '", hint:[';

  for ( var i = 0, l = hint.length; i < l; i++ ) {
    text += '"' + hint[i] + '"' + ',';
  }
  text = text.slice(0, -1);
  text += '], type:"' + type + '"}';

  return  text;

};


/**
 * メッセージ
 */
var VALIDATION_MESSAGE = {
  NONAME : "命名されていません",
  BLENDMODE: "通常以外のモードに設定されています"
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
  0 : /グループ(\s\d+)*|レイヤー(\s\d+)*|のコピー(\s\d+)*/,
  1 : /グループ(\s\d+)*|レイヤー(\s\d+)*|シェイプ(\s\d+)*|のコピー(\s\d+)*/,
  2 : /グループ(\s\d+)*|レイヤー(\s\d+)*|シェイプ(\s\d+)*|多角形(\s\d+)*|楕円形(\s\d+)*|長方形(\s\d+)*|角丸長方形(\s\d+)*|のコピー(\s\d+)*/
};


/**
 * Hidden Layer Count
 */
var h = 0;


/**
 * Layerのチェック
 * @param {Array.<Layer>} target activeDocument.layers
 * @return {void}
 */
function check(targets) {
  var i = 0, l = targets.length,
      nameRegex = NAME_REGEX["<%= config.namingLevel %>"];

  while ( i < l ) {
    var target = targets[i],
        name = target.name,
        hint = [],
        type = VALIDATION_TYPE.WARN;


    //内容による分岐
    switch ( target.kind ) {

      //文字の場合
      case LayerKind.TEXT:
//        if ( target.textItem.size < 10) {
//          hint.push(target.textItem.size);
//        }

        break;

      default:

        //命名
        if (nameRegex.test(name)) {
          hint.push(VALIDATION_MESSAGE.NONAME);
        }

    }

    //ブレンドモード
    if (target.blendMode !== BlendMode.NORMAL) {
      hint.push(VALIDATION_MESSAGE.BLENDMODE);
      type = VALIDATION_TYPE.ERROR;
    }

    //非表示レイヤーカウント
    h = (h + !target.visible)|0;

    if ( hint.length ) {
      mes.push(resultToString(name, hint, type));
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
  function _ftn(layer) {
    list.push(layer);
    return true;
  };

  function _traverse(layers) {
    var ok = true, layer;
    for (var i = 1, l = layers.length; i <= l && ok != false; i++) {
      layer = layers[l - i];

      if (layer.typename == 'LayerSet') {
        ok = _ftn(layer);
        if (ok) {
          ok = _traverse(layer.layers);
        }
      } else {
        ok = _ftn(layer);
      }
    }
    return ok;
  };

  _traverse(activeDocument.layers);

  return list;
}



if (documents.length !== 0 ) {

  layers = getLayersList();

  if (layers.length) {
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
