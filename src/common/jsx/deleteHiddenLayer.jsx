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
     * 非表示レイヤーを削除する
     * @return {void}
     */
    function deleteHiddenLayer() {
      
      _layers = DM.getNumberOfLayers(); //first count
      
      var i = 1, //index
          l = _layers,
          isEmptyGroup = false;

      while ( i <= l) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);

        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var isVisible = desc.getBoolean(stringIDToTypeID('visible'));
        var layerName = desc.getString(charIDToTypeID( 'Nm  ' ));
        var isBackground = desc.getBoolean(stringIDToTypeID("background"));
        var isDeleted = false;
        
        //グループ
        if ( layerSet === 'layerSectionStart') {
          
          if ( isNextIndexSectionEnd(i-1) ) {
            //前のレイヤーがすぐStartかチェック（trueなら空グループとする）
            isEmptyGroup = true;
          }
        }
      
        if ( layerSet === 'layerSectionEnd') {
          //不過視な</Layer group>レイヤーカウント
          _lgTotal = (_lgTotal+1)|0;
        }
        
        //alert(i + ':' + layerName + '/' + isEmptyGroup )

        //非表示であり、背景でもない、または空グループである
        if ( (!isVisible && !isBackground) || isEmptyGroup ) {

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
            
            if ( layerSet === 'layerSectionStart' ) {
              i =  (i - 1); //消した数だけindex減らす
            }

          } catch(e) {
            //エラーもみけす
            //ロックされている場合はエラーになって処理されないためフラグだけ戻す
            isEmptyGroup = false;
          }
          
        }
        
        if ( !isDeleted ) {
          i = (i+1)|0;
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
