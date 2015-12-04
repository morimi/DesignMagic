/**
 * @fileoverview 「のコピー」を削除する
 * @since version 0.5.0
 */
(function() {

  try {

    /**
     * レイヤー配列をextendするための入れ物
     * @type {Array.<Layers>}
     */
    var layers = [];


    /**
     * 処理した数
     * @type {number}
     */
    var t;

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

  //名前だしロック貫通でいい気がした
  //      if ( target.allLocked ) {
  //        continue;
  //      }

        try {

          if ( /<%= Strings.Pr_REGEX_DELETECOPYTEXT %>/.test(name) ) {
            target.name = name.replace(/<%= Strings.Pr_REGEX_DELETECOPYTEXT %>/, '');
            t = (t+1)|0;
          }

        } catch(e) {

        }

        i = (i+1)|0;
      }

    }


    if (documents.length !== 0 ) {

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

      layers = getLayersList();

      if ( layers.length ) {
        activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETECOPYTEXT %>", "deleteCopyText(layers)");

        return '{value:"complete", total:' + t + ', type: "console"}';

      } else {
        return '{value:"notfound", total:0, type: "console"}';
      }
    }


  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();
