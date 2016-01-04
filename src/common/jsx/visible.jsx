/**
 * @fileoverview レイヤー/グループの表示、非表示操作
 * idを使用する
 * data = { id: number, action:string }
 * @since version 0.4.0
 */

(function() {

  try {

    function visible() {
      var desc = new ActionDescriptor();
      var list = new ActionList();
      var ref = new ActionReference();
      var charId = ( "<%= data.action %>" === 'hidden') ? "Hd  " : "Shw ";


      ref.putIdentifier(charIDToTypeID("Lyr "), parseInt("<%= data.id %>"));
      list.putReference( ref );
      desc.putList( charIDToTypeID( "null" ), list );
      executeAction( charIDToTypeID( charId ), desc, DialogModes.NO );

      desc = null;
      list = null;
      ref = null;
    }


    if (documents.length !== 0 ) {
      visible();
    } else {
      return '{status: 404}';
    }


  } catch(e) {
    return '{type: "jsx", message: "' + e + '", status: 500}';
  }

})();
