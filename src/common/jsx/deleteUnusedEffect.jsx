/**
 * @fileoverview 未使用エフェクトを削除する
 * @since version 0.6.0
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
     * エフェクト数
     */
    var _effect = 0;
    
    
    function delFx(){
      
      var ref = new ActionReference();
      var desc = new ActionDescriptor();
      ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
      desc.putReference( charIDToTypeID( "null" ), ref );

      try {
        executeAction( stringIDToTypeID( "disableLayerStyle" ), desc, DialogModes.NO );   
      } catch(e) {}

    }
    
    /**
     * 未使用エフェクトを削除する
     * @return {void}
     */
    function deleteUnusedEffect() {
      
      _layers = DM.getNumberOfLayers(); //first count
      
      var i = 1, //index
          l = _layers,
          Effects = [];
          
      while ( i <= l) {
      
        var ref = new ActionReference();
            ref.putProperty( charIDToTypeID("Prpr") , stringIDToTypeID( "layerEffects" ));
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);
        var delALL;
        
        if( desc.hasKey(stringIDToTypeID('layerEffects')) ){
          _effect = (_effect+1)|0;
          
          if( !DM.isLayerFXVisible(i) ) {
              DM.selectLayerByIndex(i);
              delFx();
              _total = (_total+1)|0;
          }
       
          
        }//if
        
        i = (i+1)|0;
      }
    }
    
    
    if (documents.length !== 0 ) {

      app.displayDialogs = DialogModes.NO; //「現在使用できません」ダイアログ表示しない

      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEUNUSEDEFFECT %>", "deleteUnusedEffect()");

      app.displayDialogs = DialogModes.ERROR;//戻しておく

      return '{ "total":' + _total + ', "effects": ' + _effect + ', "status": 200 }';

    } else {
      return '{"status": 404}';
    }


  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }
    
}());