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
      
      _layers = DM.getNumberOfLayers();
      
      var i = 1;
          l = _layers;
      
      var isGroup = false, //グループに収まってるレイヤーであるか
          isGroupContentLocked = false; //グループ内にロックされたレイヤーがあるかどうか
      var gTotal = 0; //グループ内のレイヤー数

      while ( i <= l ) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);

        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var isVisible = desc.getBoolean(stringIDToTypeID('visible'));
        var layerName = desc.getString(charIDToTypeID( 'Nm  ' ));
        
        //グループ開始した（endが先に来る）
        isGroup = (layerSet == "layerSectionEnd") ? true : isGroup;
        
        //グループレイヤー総数カウント && (layerSet !== 'layerSectionEnd') 
        if ( isGroup && (layerSet !== 'layerSectionEnd') ) {
          gTotal = (gTotal+1)|0;
        }
        
        //何かロックされているか調べる
        var locking = desc.getObjectValue(stringIDToTypeID("layerLocking"));
        var isLock = false;
        
        //透明、画像、位置、全部
//        if (locking.getBoolean(1528) || locking.getBoolean(1529) ||
//            locking.getBoolean(1530) || locking.getBoolean(1531))
//        {
        
        //全ロックのみ
        if (locking.getBoolean(1531)){
          isLock = true;
          
          //グループ内にロックされたレイヤーがある
          if ( isGroup ) {
            isGroupContentLocked = true;
          }
          
       　}
        
        //非表示であり、ロックもされてない
        if ( !isVisible && !isLock ) {
          
          //layerSectionStartである場合は、コンテンツ内にロックレイヤーが無い場合のみ消す
          //グループに所属してないレイヤー
          if ( (layerSet == "layerSectionStart" && !isGroupContentLocked ) ||
               (layerSet != "layerSectionEnd" && !isGroup )) {
            
            desc.putReference( charIDToTypeID( "null" ), ref );
            executeAction( charIDToTypeID( "Dlt " ), desc, DialogModes.NO );

            _total = (_total + gTotal + 1)|0;
            l = (l - gTotal -1)|0;
            
            i = (i - gTotal -1)|0;
          }
        
        }

        //グループ終わった
        if ( layerSet == "layerSectionStart" ) {
          isGroup = false;
          isGroupContentLocked = false;
          gTotal = 0;
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
