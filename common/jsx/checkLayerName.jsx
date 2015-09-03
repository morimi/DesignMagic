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
  return '{title:"' + d.title + '", hint:"' + d.hint + '", type:"' + d.type + '"}';
};


/**
 * メッセージ
 */
var VALIDATION_MESSAGE = {
  NONAME : "命名されていません"
};

/**
 * タイプ
 */
var VALIDATION_TYPE = {
  WARN: "warn"
};

var mes = []; //エラーメッセージ文字列格納用
var artLayers = []; //レイヤー配列をextendするための入れ物


/**
 *
 */
function checkName(target) {

  for (var i = 0; i < target.length; i++) {
      var name = target[i].name;
      if (name.match(/レイヤー \d+/)) {

       var result = new Result(name, VALIDATION_MESSAGE.NONAME, VALIDATION_TYPE.WARN);
        mes.push(result.toString());

//        mes.push('{title:"' + name + '"'
//                + (target[i].parent && target[i].parent.typename == 'LayerSet' ?', parent: "' + target[i].parent.name + '"' : '')
//                 + ', hint:"命名されていません", type:"warn"}');
      }
  }
}

/**
 * LayerSetsの命名チェック
 * @param {Array.<Object>} layerSets
 * @return {Array.<Object>} メッセージの配列
 */
function checkSetName(target) {
  var l = target.length;

  for (var i = 0; l; i++) {
    var name = target[i].name;
    if ( name.match(/グループ \d+/) ) {
     var result = new Result(name, VALIDATION_MESSAGE.NONAME, VALIDATION_TYPE.WARN);
      mes.push(result.toString());
      //mes.push('{title:"' + name + '", hint:"命名されていません", type:"warn"}');
    }

    if (target[i].artLayers.length ){
      Array.prototype.push.apply(artLayers, target[i].artLayers);
    }

    if ( target[i].layerSets.length ) {
      checkSetName(target[i].layerSets);
    }

    if ( (l - 1) == i) {
      return mes;
    }
  }
}



if (documents.length !== 0 ) {


  checkName(activeDocument.artLayers);
  checkSetName(activeDocument.layerSets);
  checkName(artLayers);


  "[" + mes.join(',') + "]";
}
