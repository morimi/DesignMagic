
var mes = [];
var artLayers = [];

function checkName(target, parentName) {

  for (var i = 0; i < target.length; i++) {
      var name = target[i].name;
      if (name.match(/レイヤー \d+/)) {

        mes.push('{title:"' + name + '"'
                + (target[i].parent && target[i].parent.typename == 'LayerSet' ?', parent: "' + target[i].parent.name + '"' : '')
                 + ', hint:"命名されていません", type:"warn"}');
      }
  }
}

function checkSetName() {
  var l = activeDocument.layerSets.length;

  for (var i = 0; l; i++) {

    var name = activeDocument.layerSets[i].name;
    if ( name.match(/グループ \d+/) ) {
      mes.push('{title:"' + name + '", hint:"命名されていません", type:"warn"}');
    }

    if ( activeDocument.layerSets[i].artLayers.length ){

      Array.prototype.push.apply(artLayers, activeDocument.layerSets[i].artLayers);
    }

    if ( (l - 1) == i) {
      return mes;
    }
  }
}



if (documents.length !== 0 ) {


  checkName(activeDocument.artLayers);
  checkSetName();
  checkName(artLayers);


  "[" + mes.join(',') + "]";
}
