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

  for ( var i = 0; i < hint.length; i++ ) {
    text += '"' + hint[i] + '"';

    if ( i !== (hint.length-1) ) {
      text += ',';
    }
  }

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
 * @type {Array.<ArtLayers>}
 */
var artLayers = [];

/**
 * 命名チェックレベル毎の正規表現
 * 0 : レイヤー、グループ のコピー のみ
 * 1 : Lv0 + シェイプ
 * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
 */
var NAME_REGEX = {
  0 : /レイヤー(\s\d+)*|のコピー(\s\d+)*/,
  1 : /レイヤー(\s\d+)*|シェイプ(\s\d+)*|のコピー(\s\d+)*/,
  2 : /レイヤー(\s\d+)*|シェイプ(\s\d+)*|多角形(\s\d+)*|楕円形(\s\d+)*|長方形(\s\d+)*|角丸長方形(\s\d+)*|のコピー(\s\d+)*/
};


/**
 * Hidden Layer Count
 */
var h = 0;


/**
 * Layerのチェック
 * @param {Array.<ArtLayer>} target activeDocument.artLayers
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
 * LayerSetsのチェック
 * @param {Array.<LayerSet>} activeDocument.layerSets
 * @return {Array.<string>} メッセージの配列
 */
function checkSets(target) {
  var i = 0, l = target.length;

  while ( i < l ) {
    var buff = target[i];
    var name = buff.name;

    //命名
    if ( /グループ(\s\d+)*|のコピー(\s\d+)*/.test(name) ) {
      mes.push(resultToString(name, [VALIDATION_MESSAGE.NONAME], VALIDATION_TYPE.WARN));
    }

    //非表示グループカウント
    h = (h + !buff.visible)|0;

    if ( buff.artLayers ) {
      Array.prototype.push.apply(artLayers, buff.artLayers);
    }

    if ( buff.layerSets ) {
      checkSets(buff.layerSets);
    }

    if ( (l - 1) == i) {
      return mes;
    }

    i = (i+1)|0;

  }
}



if (documents.length !== 0 ) {

  Array.prototype.push.apply(artLayers, activeDocument.artLayers);
  checkSets(activeDocument.layerSets);

  if (artLayers.length) {
    check(artLayers);
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
