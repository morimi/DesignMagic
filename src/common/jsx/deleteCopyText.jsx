/**
 * @fileoverview 「のコピー」を削除する
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
     * 「のコピー」を削除する
     * @param {Array.<Layer>} target activeDocument.layers
     * @return {void}
     */
    function deleteCopyText() {
      var i = 1,
          l = DM.getNumberOfLayers();

      //処理ここから
      while ( i < l ) {
        var ref = new ActionReference();
            ref.putIndex( charIDToTypeID( "Lyr " ), i);
        var desc = executeActionGet(ref);
        
        var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
        var kind = desc.getInteger(stringIDToTypeID("layerKind"));
        
        if ( layerSet != "layerSectionEnd" && kind !== 3 ) {
          var name = desc.getString(stringIDToTypeID('name'));
          
          if ( /<%= Strings.Pr_REGEX_DELETECOPYTEXT %>/.test(name) ) {
            var id = desc.getInteger(stringIDToTypeID('layerID'));
            var newName = name.replace(/<%= Strings.Pr_REGEX_DELETECOPYTEXT %>/, '');
          
            DM.changeLayerNameById(id, newName);
            
            _total = (_total+1)|0;
          }
        }
        
        i = (i+1)|0;
      }

    }


    if (documents.length !== 0 ) {

      var aLayer = activeDocument.activeLayer;
      
      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETECOPYTEXT %>", "deleteCopyText()");

      activeDocument.activeLayer = aLayer;
      
      return '{ "total":' + _total + ',  "status": 200 }';

    } else {
      return '{"status": 404}';
    }

  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();
