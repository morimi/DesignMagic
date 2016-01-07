/**
 * @fileoverview レイヤー/グループを選択する
 * idを使用する
 * data = { id: number }
 * @since version 0.4.0
 */

(function() {
  
  try {

    if (documents.length !== 0 ) {
      
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      var list = new ActionList();
      var id = parseInt("<%= id %>");

      ref.putIdentifier( charIDToTypeID("Lyr "), id );
      desc.putReference( charIDToTypeID( "null" ), ref );
      desc.putBoolean( charIDToTypeID( "MkVs" ), false );

      list.putInteger( id );
      desc.putList( charIDToTypeID( "LyrI" ), list );
      executeAction(  charIDToTypeID( "slct" ), desc, DialogModes.NO );
      
      return '{"status": 200}';
      
    } else {
      return '{"status": 404}';
    }

  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

}());