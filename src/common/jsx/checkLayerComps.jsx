/**
 * @fileoverview LayerCompsのチェック
 */
(function() {
  
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

        return '{value: "' + n + '", type: "valid"}';

      } else { //選択されてない

        return '{value: "0", type: "valid"}';

      }

    } else {

      return '{value: "0", type: "warn"}';

    }
  }

  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();