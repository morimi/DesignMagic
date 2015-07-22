
var mes = [];
var artLayers = []; //レイヤー配列をextendするための入れ物


/**
 *
 */
function checkName(target) {

  for (var i = 0; i < target.length; i++) {
      var name = target[i].name;
      if (name.match(/レイヤー \d+/)) {

        mes.push('{title:"' + name + '"'
                + (target[i].parent && target[i].parent.typename == 'LayerSet' ?', parent: "' + target[i].parent.name + '"' : '')
                 + ', hint:"命名されていません", type:"warn"}');
      }
  }
}

function checkSetName(target) {
  var l = target.length;

  for (var i = 0; l; i++) {
    var name = target[i].name;
    if ( name.match(/グループ \d+/) ) {
      mes.push('{title:"' + name + '", hint:"命名されていません", type:"warn"}');
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
