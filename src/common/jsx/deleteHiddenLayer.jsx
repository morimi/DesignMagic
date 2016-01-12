/**
 * @fileoverview 非表示レイヤーを削除する
 * @since version 0.4.0
 */
(function() {

  try {
    
    /**
     * 処理した数
     * @type {number}
     */
    var _total = 0;
    
    /**
     * レイヤー数
     * @type {number}
     */
    var _layers = 0;
    
    /**
     * 非表示レイヤーを削除する
     * @return {void}
     */
    function deleteHiddenLayer() {
      
      var i = 1;
          _layers = DM.getNumberOfLayers();

      while ( i < _layers ) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);

        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var isBackground = desc.getBoolean(stringIDToTypeID("background"));
        var isVisible = desc.getBoolean(stringIDToTypeID('visible'));
        var layerName = desc.getString(charIDToTypeID( 'Nm  ' ));
          
        if ( layerSet != "layerSectionEnd" && !isBackground ) {
        
          if ( !isVisible ) {
            desc.putReference( charIDToTypeID( "null" ), ref );
            executeAction( charIDToTypeID( "Dlt " ), desc, DialogModes.NO );
            
            _total = (_total+1)|0;
            _layers = (_layers-1)|0;
            i = (i-1)|0;
          }
        
        }

        i = (i+1)|0;
      }

    }


    if (documents.length !== 0 ) {

      app.displayDialogs = DialogModes.NO; //「現在使用できません」ダイアログ表示しない

      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEHIDDENLAYER %>", "deleteHiddenLayer()");

      app.displayDialogs = DialogModes.ERROR;//戻しておく

      return '{ "total":' + _total + ', "layers": ' + _layers + ', "status": 200 }';

    } else {
      return '{"status": 404}';
    }


  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

})();
