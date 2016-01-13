/**
 * @fileoverview 非表示レイヤーを削除する
 * レイヤー数が多いとCPU使用率ぶっちぎるので注意が必要
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
     * 初期レイヤー数
     * @type {number}
     */
    var _layers = 0;
      
    
    /**
     * </Layer group>のレイヤー数
     * @type {number}
     */
    var _lgTotal = 0;
    
    
    /**
     * 非表示レイヤーを削除する
     * @return {void}
     */
    function deleteHiddenLayer() {
      
      _layers = DM.getNumberOfLayers(); //first count
      
      var i = _layers; //index
          l = _layers;

      while ( i != 0 ) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);

        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var isVisible = desc.getBoolean(stringIDToTypeID('visible'));
        //var layerName = desc.getString(charIDToTypeID( 'Nm  ' ));
        var isBackground = desc.getBoolean(stringIDToTypeID("background"));
        var isDeleted = false;
        
        //alert(i + ':' + layerName + '/' + layerSet )
      
        if ( layerSet === 'layerSectionEnd') {
          //不過視な</Layer group>レイヤーカウント
          _lgTotal = (_lgTotal+1)|0;
        }

        //非表示であり、背景でもない
        if ( !isVisible && !isBackground ) {

          try {
            desc.putReference( charIDToTypeID( "null" ), ref );
            executeAction( charIDToTypeID( "Dlt " ), desc, DialogModes.NO );

            var l2 = DM.getNumberOfLayers(); //second count
            var deleted = Math.abs(l - l2); //差分
            isDeleted = true;
            
            _total = _total + 1; //削除数
            
            //alert('i:'+ i + ' l:'+ l + ' l2:' + l2 + ' deleted:' + deleted + ' total:' + _total)
      
            l = l2;
            i =  (i - deleted); //消した数だけindex減らす

          } catch(e) {
            //エラーもみけす
          }
          
        }
        
        if ( !isDeleted ) {
          i = (i-1)|0;
        }
        
      }

    }


    if (documents.length !== 0 ) {

      app.displayDialogs = DialogModes.NO; //「現在使用できません」ダイアログ表示しない

      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEHIDDENLAYER %>", "deleteHiddenLayer()");

      app.displayDialogs = DialogModes.ERROR;//戻しておく

      return '{ "total":' + _total + ', "layers": ' + (_layers - _lgTotal) + ', "status": 200 }';

    } else {
      return '{"status": 404}';
    }


  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

})();
