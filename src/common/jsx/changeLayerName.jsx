/**
 * @fileoverview レイヤー/グループ名の変更処理をする
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
     * @type {boolean}
     */

    var _isAll = "<%= data.isAll %>" === 'true';

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

          if ( _baseName && layer.name === _baseName ) {
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
   * 選択状態のレイヤー/グループの名前を変更する
   */
  function changeLayerName() {
    function cTID(s) { return app.charIDToTypeID(s); };
    function sTID(s) { return app.stringIDToTypeID(s); };

    var desc = new ActionDescriptor();
    var ref = new ActionReference();
    var idLyr = cTID( "Lyr " );
    ref.putEnumerated( idLyr, cTID( "Ordn" ), cTID( "Trgt" ) );
    desc.putReference( cTID( "null" ), ref );

    //元の名前を保存しておく
    _baseName = executeActionGet(ref).getString(charIDToTypeID( "Nm  " ));

    var desc54 = new ActionDescriptor();
    desc54.putString( cTID( "Nm  " ), _newName );
    desc.putObject( cTID( "T   " ), cTID( "Lyr " ), desc54 );
    executeAction( cTID( "setd" ), desc, DialogModes.NO );

  }


  /**
   * 渡された全てのレイヤー/グループ名を変更する
   */
  function _changeAllLayerName(targets) {
    var i = 0, l = targets.length;

    while ( i < l ) {
      var target = targets[i];

      target.name = _newName;

      i = (i+1)|0;
    }
  }


  if (documents.length !== 0 ) {

    changeLayerName();

    if ( _isAll ) {

      layers = getLayersList();

      if ( layers.length ) {
          activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_CHANGELAYERNAME %>", "_changeAllLayerName(layers)");
      }

      return '{value:"complete", baseName: "' + _baseName + '", total:' + layers.length + ', type: "console"}';

    } else {
       return '{value:"complete", baseName: "' + _baseName + '", total:1, type: "console"}';
    }
  }

} catch(e) {
  return '{errorType: "jsx", errorMessage: "' + e + '"}';
}

})();
