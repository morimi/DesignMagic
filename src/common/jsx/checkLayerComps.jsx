/**
 * @fileoverview LayerCompsのチェック
 */

try {

if (documents.length > 0 ) {
  if ( activeDocument.layerComps.length ) {
    var n;

    for (var i = 0; i < activeDocument.layerComps.length; i++ ) {
      var comp = activeDocument.layerComps[i];
      if ( comp.selected ) {
        n = comp.name;
      }
    }

    if ( n !== undefined ) { //valid

      '{value: "' + n + '", type: "valid"}';

    } else { //選択されてない

      '{value: "0", type: "valid"}';

    }

  } else {

    '{value: "0", type: "warn"}';

  }
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
