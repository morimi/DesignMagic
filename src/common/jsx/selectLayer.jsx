/**
 * @fileoverview レイヤー/グループを選択する
 * idとレイヤー名を使用する
 * data = { id: number }
 * @since version 0.4.0
 */


try {

  function selectLayer() {

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    var list = new ActionList();
    
    var id = parseInt("<%= data.id %>");

    ref.putIdentifier( charIDToTypeID("Lyr "), id );
    desc.putReference( charIDToTypeID( "null" ), ref );
    desc.putBoolean( charIDToTypeID( "MkVs" ), false );

    list.putInteger( id );
    desc.putList( charIDToTypeID( "LyrI" ), list );
    executeAction(  charIDToTypeID( "slct" ), desc, DialogModes.NO );
    
  }

  if (documents.length !== 0 ) {

    selectLayer();
  }

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
