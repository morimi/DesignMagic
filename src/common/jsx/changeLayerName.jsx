/**
 * @fileoverview レイヤー/グループ名の変更処理をする
 * @since version 0.4.0
 */
(function() {
try {


  /**
   * 元の名前
   * @type {string}
   */
  var _baseName;


  /**
   * 新しい名前
   * @type {string}
   */
  var _newName = "<%= data.newName %>";


  /**
   * IDの配列
   * @type {Array.<number>}
   */
  var _ids = "<%= data.ids %>".split(',');


  var _id = parseInt("<%= data.id %>");
  
  /**
   * レイヤー名を変更する
   * @param {number} id レイヤーのID
   * @param {striing} name レイヤー名
   */
  function changeLayerName(id, name) {
    var ref = new ActionReference();
    var desc = new ActionDescriptor();
    ref.putIdentifier(charIDToTypeID("Lyr "), id);
    desc.putReference( charIDToTypeID( "null" ), ref );

    var desc2 = new ActionDescriptor();
    desc2.putString( charIDToTypeID( "Nm  " ), name );
    desc.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Lyr " ), desc2 );
    executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO );
  }

  /**
   * IDを元にレイヤーを選択する
   * @param {number} id レイヤーのID
   */
  function selectLayer(id) {
    var desc = new ActionDescriptor();
    var ref = new ActionReference();

    ref.putIdentifier(charIDToTypeID("Lyr "), id);
    desc.putReference( charIDToTypeID( "null" ), ref );
    desc.putBoolean( charIDToTypeID( "MkVs" ), false );
    executeAction(  charIDToTypeID( "slct" ), desc, DialogModes.NO );
  }

  /**
   * IDを渡された全てのレイヤー/グループ名を変更する
   * @param {Array.<number>} ids レイヤーID
   */
  function _changeAllLayerName(ids) {
    var i = 0, l = ids.length;

    while ( i < l ) {
      var id = parseInt(ids[i]);

      selectLayer(id);
      changeLayerName(id, _newName);

      i = (i+1)|0;
    }
    
    selectLayer(_id);
  }


  if (documents.length !== 0 ) {

    activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_CHANGELAYERNAME %>", "_changeAllLayerName(_ids)");

    return '{total:' + _ids.length + ', name:"' + _newName + '", ids:[' +  _ids.join(',') +'], status: 200}';
  } else {
    return '{status: 404}';
  }

} catch(e) {
    return '{type: "jsx", message: "' + e + '", status: 500}';
}

})();
