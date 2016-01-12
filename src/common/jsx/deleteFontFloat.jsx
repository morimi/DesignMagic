/**
 * @fileoverview フォントの値に含まれる小数点を削除する
 * @since version 0.4.0
 */
(function() {

  try {

    /**
     * レイヤー数（フォントのみ）
     * @type {number}
     */
    var _layers = 0;


    /**
     * 処理した数
     * @type {number}
     */
    var _total = 0;

    /**
     * テキストパネルにフォントサイズをセットする
     * 編集対象が選択状態でないとエラーになる
     * @param {Layer} layer テキストレイヤーオブジェクト
     * @param {number} size フォントサイズ
     * @see https://forums.adobe.com/thread/1954020
     */
    function setTextSize(id, size) {

      var ref = new ActionReference();
      var desc = new ActionDescriptor();
      var desc2 = new ActionDescriptor();

      ref.putProperty( charIDToTypeID( "Prpr" ), charIDToTypeID( "TxtS" ) );
      ref.putEnumerated( charIDToTypeID( "TxLr" ), charIDToTypeID( "Ordn" ), charIDToTypeID( "Trgt" ) );
      desc.putReference( charIDToTypeID( "null" ), ref );

      desc2.putInteger( stringIDToTypeID( "textOverrideFeatureName" ), 808465458 );
      desc2.putInteger( stringIDToTypeID( "typeStyleOperationType" ), 3 );

      var unit = "#Pxl";

      if ( preferences.typeUnits === Units.POINTS ) {
        unit = '#Pnt';
      } else if ( preferences.typeUnits === Units.MM ) {
        unit = '#Mlm';
      }

      desc2.putUnitDouble( charIDToTypeID( "Sz  " ), charIDToTypeID( unit ), size );
      desc.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "TxtS" ), desc2 );

      executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO );

    }


    /**
     * フォントサイズに含まれる小数点を削除する
     * @param {Array.<Layer>} target activeDocument.layers
     * @return {void}
     */
    function deleteFontFloat() {
      var i = 1, l = DM.getNumberOfLayers();

      //削除はじまる〜
      while ( i <= l ) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);
        var kind = desc.getInteger(stringIDToTypeID("layerKind"));
        
        if ( kind === 3 ) { //テキスト
          var id = desc.getInteger(stringIDToTypeID('layerID')),
              textDesc = desc.getObjectValue(stringIDToTypeID('textKey')),
              textContent = textDesc.getString(stringIDToTypeID("textKey"));
            
          _layers = (_layers+1)|0;
          
          if ( textContent.length ) { //内容がある
            
            var size = DM.getTextSize(textDesc);
            
            if ( /\./.test(size) ) { //小数点がある

              DM.selectLayerById(id);
              
              setTextSize(id, Math.round(size));

              _total = (_total+1)|0;

            }
            
          }
          
        }

        i = (i+1)|0;
      }

    }

    if (documents.length !== 0 ) {

      var aLayer = activeDocument.activeLayer;

      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEFONTFLOAT %>", "deleteFontFloat()");

      activeDocument.activeLayer = aLayer;

      return '{ "total":' + _total + ', "layers": ' + _layers + ', "status": 200 }';

    } else {
      return '{"status": 404}';
    }


  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();
