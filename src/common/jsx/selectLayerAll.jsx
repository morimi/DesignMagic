/**
 * @fileoverview レイヤー/グループを複数選択する
 * idを使用する
 * data = { id: id }
 * @since version 0.4.0
 */


try {

  function selectLayerAll() {

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    
    var id = parseInt("<%= data.id %>");

    ref.putIdentifier( charIDToTypeID("Lyr "), id );

    desc.putReference( charIDToTypeID( "null" ), ref );
    desc.putEnumerated( stringIDToTypeID( "selectionModifier" ),
                        stringIDToTypeID( "selectionModifierType" ),
                        stringIDToTypeID( "addToSelection" )
                       );
      
    desc.putBoolean( charIDToTypeID( "MkVs" ), false );

    executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
  }

  if (documents.length !== 0 ) {

    selectLayerAll();
  }

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
