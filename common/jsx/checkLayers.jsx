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
 * @type {Array.<Object>}
 */
var artLayers = [];


/**
 * Layerのチェック
 * @param {Array.<Object>} target activeDocument.artLayers
 * @return {void}
 */
function check(targets) {

  for (var i = 0; i < targets.length; i++) {
    var target = targets[i],
        name = target.name,
        level = "<%= config.namingLevel %>",
        hint = [],
        type = VALIDATION_TYPE.WARN,
        regex;

    /**
     * 命名チェックレベル
     * 0 : レイヤー、グループ のみ
     * 1 : Lv0 + シェイプ
     * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
     */
    switch(level) {
      case "1":
        regex = /[レイヤー|シェイプ] \d+/;
        break;
      case "2":
        regex = /[レイヤー|シェイプ|多角形|楕円形|長方形|角丸長方形] \d+/;
        break;
      default:
        regex = /レイヤー \d+/;
    }

    //命名
    if (name.match(regex)) {
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
  }
}

/**
 * LayerSetsのチェック
 * @param {Array.<Object>} activeDocument.layerSets
 * @return {Array.<string>} メッセージの配列
 */
function checkSets(target) {
  var l = target.length;

  for (var i = 0; l; i++) {
    var name = target[i].name;

    //命名
    if ( name.match(/グループ \d+/) ) {
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
  }
}



if (documents.length !== 0 ) {


  check(activeDocument.artLayers);
  checkSets(activeDocument.layerSets);
  check(artLayers);


  "[" + mes.join(',') + "]";
}
