/**
 * @fileoverview 空のグループを削除する
 * @since version 0.5.0
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
     * グループ数
     * @type {number}
     */
    var _groups = 0;
      
    
    /**
     * </Layer group>のレイヤー数
     * @type {number}
     */
    var _lgTotal = 0;
    
    
    /**
     * 渡されたindexのレイヤーがlayerSectionEndであるかチェックする
     * @param {number} idx インデックス
     * @return {boolean} layerSectionEndならtrue　ほかfalse
     */
    function isNextIndexSectionEnd(idx) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), idx);
        var desc = executeActionGet(ref);
        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        
      return layerSet === 'layerSectionEnd';
    }
    
    
    /**
     * 空のグループを削除する
     * @return {void}
     */
    function deleteEmptyGroup() {
      
      _layers = DM.getNumberOfLayers(); //first count
      
      var i = _layers, //index
          l = _layers,
          isEmptyGroup = false;

      while ( i != 0 ) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);

        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var layerName = desc.getString(charIDToTypeID( 'Nm  ' ));
        var isDeleted = false;
        
        //グループ
        if ( layerSet === 'layerSectionStart' ) {
          _groups = (_groups+1)|0;
          
          //次のレイヤーがすぐEndかチェック（trueなら空グループとする）
          if ( isNextIndexSectionEnd(i-1) ) {
            isEmptyGroup = true;
          }
           
        }
        
        if ( isEmptyGroup ) {

          try {
            desc.putReference( charIDToTypeID( "null" ), ref );
            executeAction( charIDToTypeID( "Dlt " ), desc, DialogModes.NO );

            var l2 = DM.getNumberOfLayers(); //second count
            var deleted = Math.abs(l - l2); //差分
            isDeleted = true;
            isEmptyGroup = false;
            
            _total = _total + 1; //削除数
            
            //alert('i:'+ i + ' l:'+ l + ' l2:' + l2 + ' deleted:' + deleted + ' total:' + _total)
      
            l = l2;
            i =  (i - deleted)|0; //消した数だけindex減らす

          } catch(e) {
            //ロックされている場合はエラーになって処理されないためフラグだけ戻す
            isEmptyGroup = false;
          }
          
        }
        
        if ( !isDeleted ) {
          i = (i-1)|0;
        }
        
      }

    }


    if (documents.length !== 0 ) {

      app.displayDialogs = DialogModes.NO; //「現在使用できません」ダイアログ表示しない

      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEEMPTYGROUP %>", "deleteEmptyGroup()");

      app.displayDialogs = DialogModes.ERROR;//戻しておく

      return '{ "total":' + _total + ', "groups": ' + _groups + ', "status": 200 }';

    } else {
      return '{"status": 404}';
    }


  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

})();
