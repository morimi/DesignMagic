/**
 * @fileoverview レイヤー/グループを選択する
 * idとレイヤー名を使用する
 * data = { name: string, id: number }
 * @since version 0.4.0
 */


try {

  function selectLayer() {
    function cTID(s) { return app.charIDToTypeID(s); };
    function sTID(s) { return app.stringIDToTypeID(s); };

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    var list = new ActionList();

    //ref.putName( cTID( "Lyr " ), "<%= data.name %>");
    ref.putIdentifier(cTID("Lyr "), parseInt("<%= data.id %>"));
    desc.putReference( cTID( "null" ), ref );
    desc.putBoolean( cTID( "MkVs" ), false );

    list.putInteger( parseInt("<%= data.id %>") );
    desc.putList( cTID( "LyrI" ), list );
    executeAction(  cTID( "slct" ), desc, DialogModes.NO );
  }

  if (documents.length !== 0 ) {

    selectLayer();
  }

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
