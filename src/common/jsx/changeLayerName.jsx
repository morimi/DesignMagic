/**
 * @fileoverview レイヤー/グループ名の変更処理をする
 * @since version 0.4.0
 */

try {

  function changeLayerName() {
    function cTID(s) { return app.charIDToTypeID(s); };
    function sTID(s) { return app.stringIDToTypeID(s); };

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    var idLyr = cTID( "Lyr " );
    ref.putEnumerated( idLyr, cTID( "Ordn" ), cTID( "Trgt" ) );
    desc.putReference( cTID( "null" ), ref );

    var desc54 = new ActionDescriptor();
    desc54.putString( cTID( "Nm  " ), """<%= data.name %>""" );
    desc.putObject( cTID( "T   " ), cTID( "Lyr " ), desc54 );
    executeAction( cTID( "setd" ), desc, DialogModes.NO );

  }

  if (documents.length !== 0 ) {

    changeLayerName();

  }

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
