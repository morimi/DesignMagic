/**
 * @fileoverview 非表示レイヤーを削除する
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
     * 現在のレイヤー構造体から平坦化した配列を返却
     * @return {Array.<Layer>}
     */
    function getLayersList() {

      var list = [];

      function _traverse(layers) {
        var i = 0, l = layers.length;
        while ( i < l ) {
          var layer = layers[i];

          if ( !layer.allLocked && !layer.isBackgroundLayer && !layer.visible ) {
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

      while ( i < l ) {
        var target = targets[i];

        try {

          target.remove();

        } catch(e) {

        }

        i = (i+1)|0;
      }

    }


    if (documents.length !== 0 ) {

      layers = getLayersList();

      if ( layers.length ) {
        activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEHIDDENLAYER %>", "deleteCopyText(layers)");

        return '{value:"complete", total:' + layers.length + ', type: "console"}';

      } else {
        return '{value:"nolayers", total:0, type: "console"}';
      }
    }


  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();
