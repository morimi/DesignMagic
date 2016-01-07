/**
 * @fileoverview レイヤー/グループを複数選択する
 * idを使用する
 * data = { ids: ids }
 * @since version 0.4.0
 */

(function() {
  
  try {

    if (documents.length === 0 ) {
      return '{"status": 404}';
    }
    
    var desc = new ActionDescriptor();
    var ref = new ActionReference();

    var ids = "<%= ids %>";

    if ( !ids ) {
      return '{"value":"noids", "type": "error", "status": 200}';
    }

    ids = ids.split(',');

    var i = 0, l = ids.length;

    while(i < l) {
      ref.putIdentifier( charIDToTypeID("Lyr "), ids[i] );
      i = i+1|0;
    }

    desc.putReference( charIDToTypeID( "null" ), ref );
    desc.putEnumerated( stringIDToTypeID( "selectionModifier" ),
                        stringIDToTypeID( "selectionModifierType" ),
                        stringIDToTypeID( "addToSelection" )
                       );

    desc.putBoolean( charIDToTypeID( "MkVs" ), false );

    executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );
    
    
    return '{ "value":"complete", "total":' + l + ', "ids": [<%= ids %>], "status": 200}';
    

  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

}());