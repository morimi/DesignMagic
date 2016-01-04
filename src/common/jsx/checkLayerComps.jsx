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

        return '{value: "' + n + '", type: "valid", status: 200}';

      } else { //選択されてない

        return '{value: "0", type: "valid", status: 200}';

      }

    } else {

      return '{value: "0", type: "warn", status: 200}';

    }
  } else {
      return '{ status: 404 }';
  }

  } catch(e) {
    return '{type: "jsx", message: "' + e + '", status: 500}';
  }

})();