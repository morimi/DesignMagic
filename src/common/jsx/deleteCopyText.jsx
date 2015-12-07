/**
 * @fileoverview 「のコピー」を削除する
 * @since version 0.4.0
 */
(function() {

  try {

    /**
     * レイヤー配列をextendするための入れ物
     * @type {Array.<Layers>}
     */
    var layers = [];

    /**
     * 現在のレイヤー構造体から平坦化した配列を返却
     * @return {Array.<Layer>}
     */
    function getLayersList() {

      var list = [];

      function _traverse(layers) {
        var i = 0, l = layers.length;
        while ( i < l ) {
          var layer = layers[i],
              name = layer.name;


          if ( /<%= Strings.Pr_REGEX_DELETECOPYTEXT %>/.test(name) ) {
            list.push(layer);
          }

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

      //選択されてないとエラー（ユーザーにより操作がキャンセルされました）になるため
      //activeLayerを選択状態にしておく
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putName( charIDToTypeID( "Lyr " ), activeDocument.activeLayer.name );
      desc.putReference( charIDToTypeID( "null" ), ref );
      desc.putBoolean( charIDToTypeID( "MkVs" ), false );
      var list = new ActionList();
      list.putInteger( activeDocument.activeLayer.id );
      desc.putList( charIDToTypeID( "LyrI" ), list );
      executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );

      //処理ここから
      while ( i < l ) {
        var target = targets[i],
            name = target.name;

  //名前だしロック貫通でいい気がした
  //      if ( target.allLocked ) {
  //        continue;
  //      }

        try {

          target.name = name.replace(/<%= Strings.Pr_REGEX_DELETECOPYTEXT %>/, '');

        } catch(e) {

        }

        i = (i+1)|0;
      }

    }


    if (documents.length !== 0 ) {

      layers = getLayersList();

      if ( layers.length ) {
        activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETECOPYTEXT %>", "deleteCopyText(layers)");

        return '{value:"complete", total:' + layers.length + ', type: "console"}';

      } else {
        return '{value:"notfound", total:0, type: "console"}';
      }
    }


  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();
