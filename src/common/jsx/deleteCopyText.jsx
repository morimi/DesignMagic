/**
 * @fileoverview 「のコピー」を削除する
 * @since version 0.5.0
 */


try {

  /**
   * レイヤー配列をextendするための入れ物
   * @type {Array.<Layers>}
   */
  var layers = [];


  if ( layers.length ) {
    check(layers);
  }

  /**
   * 現在のレイヤー構造体から平坦化した配列を返却
   * @return {Array.<Layer>}
   */
  function getLayersList() {

    var list = [];

    function _traverse(layers) {
      var i = 0, l = layers.length;
      while ( i < l ) {
        var layer = layers[i];

        list.push(layer);

        if ( layer.typename === 'LayerSet' ) {
          _traverse(layer.layers);
        }

        i = (i+1)|0;
      }
    }

    _traverse(activeDocument.layers);

    return list;
  }

  /**
   * 「のコピー」を削除する
   * @param {Array.<Layer>} target activeDocument.layers
   * @return {void}
   */
  function deleteCopyText(targets) {
    var i = 0, l = targets.length;

    while ( i < l ) {
      var target = targets[i],
          name = target.name;

      if ( target.allLocked ) {
        continue;
      }

      if ( /のコピー(\s\d+)*/.test(name) ) {
        target.name = name.replace(/のコピー(\s\d+)*/, '');
      }

      i = (i+1)|0;
    }

  }


  if (documents.length !== 0 ) {

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    ref.putName( charIDToTypeID( "Lyr " ), activeDocument.activeLayer.name );
    desc.putReference( charIDToTypeID( "null" ), ref );
    desc.putBoolean( charIDToTypeID( "MkVs" ), false );
    var list = new ActionList();
    list.putInteger( activeDocument.activeLayer.id );
    desc.putList( charIDToTypeID( "LyrI" ), list );
    executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );

    layers = getLayersList();

    if ( layers.length ) {
      deleteCopyText(layers);
    }
  }


} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
