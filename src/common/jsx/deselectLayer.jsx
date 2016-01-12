/**
 * @fileoverview レイヤー/グループの選択解除
 * https://forums.adobe.com/thread/1184247の解答より
 * @since version 0.5.0
 */

(function() {
  
  try {

    if (documents.length !== 0 ) {
      
      DM.activeLayer = activeDocument.activeLayer;
      
      var desc = new ActionDescriptor();
      var ref = new ActionReference();

      ref.putEnumerated( charIDToTypeID('Lyr '), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );   
      desc.putReference( charIDToTypeID('null'), ref );   
      executeAction( stringIDToTypeID('selectNoLayers'), desc, DialogModes.NO ); 
      
      return '{"status": 200}';
      
    } else {
      return '{"status": 404}';
    }

  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

}());