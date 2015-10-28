/**
 * @fileoverview layerSets & artLayersの命名チェック
 */


/**
 * Result
 * バリデーション結果
 * @param {string} title
 * @param {string} hint
 * @param {string} type
 */
function Result(title, hint, type) {
  this.data = {
      title : title || null,
      hint : hint || null,
      type : type || null
  };
}

/**
 * @return {string} this.dataをJSON.stringifyした文字列
 */
Result.prototype.toString = function resultToString() {
  //return JSON.stringify(this.data); JSON使えないよ
  var d = this.data;
  //return '{title:"' + d.title + '", hint:"' + d.hint + '", type:"' + d.type + '"}';

  var text = '{title:"' + d.title + '", hint:[';

  for ( var i = 0; i < d.hint.length; i++ ) {
    text += '"' + d.hint[i] + '"';

    if ( i !== (d.hint.length-1) ) {
      text += ',';
    }
  }

  text += '], type:"' + d.type + '"}';

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
 * Layerのチェック
 * @param {Array.<ArtLayer>} target activeDocument.artLayers
 * @return {void}
 */
function check(targets) {
  var i = 0;

  while (i < targets.length ) {
    var target = targets[i],
        name = target.name,
        level = "<%= config.namingLevel %>",
        hint = [],
        type = VALIDATION_TYPE.WARN,
        regex;

    /**
     * 命名チェックレベル
     * 0 : レイヤー、グループ のコピー のみ
     * 1 : Lv0 + シェイプ
     * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
     */
    switch(level) {
      case "1":
        regex = /レイヤー(\s\d+)*|シェイプ(\s\d+)*|のコピー(\s\d+)*/;
        break;
      case "2":
        regex = /レイヤー(\s\d+)*|シェイプ(\s\d+)*|多角形(\s\d+)*|楕円形(\s\d+)*|長方形(\s\d+)*|角丸長方形(\s\d+)*|のコピー(\s\d+)*/;
        break;
      default:
        regex = /レイヤー(\s\d+)*|のコピー(\s\d+)*/;
    }

    //命名
    if (regex.test(name)) {
      hint.push(VALIDATION_MESSAGE.NONAME);
    }

    //ブレンドモード
    if (target.blendMode !== BlendMode.NORMAL) {
      hint.push(VALIDATION_MESSAGE.BLENDMODE);
      type = VALIDATION_TYPE.ERROR;
    }

    if ( hint.length ) {
      var result = new Result(name, hint, type );
      mes.push(result.toString());
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

  while ( i < target.length ) {
    var name = target[i].name;
    //命名
    if ( /グループ(\s\d+)*|のコピー(\s\d+)*/.test(name) ) {
     var result = new Result(name, [VALIDATION_MESSAGE.NONAME], VALIDATION_TYPE.WARN);
      mes.push(result.toString());
    }

    if (target[i].artLayers.length ){
      Array.prototype.push.apply(artLayers, target[i].artLayers);
    }

    if ( target[i].layerSets.length ) {
      checkSets(target[i].layerSets);
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
    "[" + mes.join(',') + "]";
  }
}
