/**
 * @fileoverview フォントの値に含まれる小数点を削除する
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
     * 処理した数
     * @type {number}
     */
    var total = 0;


    /**
     * テキストレイヤーの拡大率を得る
     * @param {string} direction 縦または横を指定 'yy' or 'xx'
     * @return {number} 拡大率
     * @see https://forums.adobe.com/thread/1954020
     */
    function _getTextScale(direction, layer) {
      var ref = new ActionReference();
      ref.putIdentifier(charIDToTypeID('Lyr '), layer.id);

      var desc = executeActionGet(ref).getObjectValue(stringIDToTypeID('textKey'));
      if (desc.hasKey(stringIDToTypeID('transform'))) {
        var transform = desc.getObjectValue(stringIDToTypeID('transform'));
        var mFactor = transform.getUnitDoubleValue (stringIDToTypeID(direction));
        return mFactor;
      }
      return 1;
    }


    /**
     * 拡大率を考慮したフォントサイズを得る（文字パネルと同じ値）
     * @param {Layer} layer テキストレイヤーオブジェクト
     * @return {number} フォントサイズ
     * @see https://forums.adobe.com/thread/1954020
     */
    function getTextSize(layer) {

      var text_item = layer.textItem;
      var pixels = text_item.size.value;
      var scale = _getTextScale('yy', layer);

      return Math.round((pixels * scale) * 100) / 100;
    }

    /**
     * テキストパネルにフォントサイズをセットする
     * @param {Layer} layer テキストレイヤーオブジェクト
     * @param {number} size フォントサイズ
     * @see https://forums.adobe.com/thread/1954020
     */
    function setTextSize(layer, size) {
      function cTID(s) { return app.charIDToTypeID(s); };
      function sTID(s) { return app.stringIDToTypeID(s); };

      activeDocument.activeLayer = layer;

      var ref = new ActionReference();
      var desc47 = new ActionDescriptor();
      var desc48 = new ActionDescriptor();

      ref.putProperty( cTID( "Prpr" ), cTID( "TxtS" ) );
      ref.putEnumerated( cTID( "TxLr" ), cTID( "Ordn" ), cTID( "Trgt" ) );
      desc47.putReference( cTID( "null" ), ref );

      desc48.putInteger( sTID( "textOverrideFeatureName" ), 808465458 );
      desc48.putInteger( sTID( "typeStyleOperationType" ), 3 );

      var unit = "#Pxl";

      if ( preferences.typeUnits === Units.POINTS ) {
        unit = '#Pnt';
      } else if ( preferences.typeUnits === Units.MM ) {
        unit = '#Mlm';
      }

      desc48.putUnitDouble( cTID( "Sz  " ), cTID( unit ), size );
      desc47.putObject( cTID( "T   " ), cTID( "TxtS" ), desc48 );

      executeAction( cTID( "setd" ), desc47, DialogModes.NO );

      //バグってて反映されない
      layer.textItem.size = new UnitValue(size, RULERUNITS[preferences.typeUnits]);

    }

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

          if ( layer.kind === LayerKind.TEXT) {
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
     * フォントサイズに含まれる小数点を削除する
     * @param {Array.<Layer>} target activeDocument.layers
     * @return {void}
     */
    function deleteFontFloat(targets) {
      var i = 0, l = targets.length;

      //選択されてないとエラー（ユーザーにより操作がキャンセルされました）になるため
      //activeLayerを選択状態にしておく
      var desc = new ActionDescriptor();
      var ref = new ActionReference();
      ref.putName( charIDToTypeID( "Lyr " ), activeDocument.activeLayer.name );
      desc.putReference( charIDToTypeID( "null" ), ref );
      desc.putBoolean( charIDToTypeID( "MkVs" ), false );
      var list = new ActionList();
      list.putInteger( activeDocument.activeLayer.id );
      desc.putList( charIDToTypeID( "LyrI" ), list );
      executeAction( charIDToTypeID( "slct" ), desc, DialogModes.NO );

      //削除はじまる〜
      while ( i < l ) {
        var target = targets[i];

  //ロック貫通
  //      if ( target.allLocked ) {
  //        continue;
  //      }

        try {

          var size = getTextSize(target);

          if ( /\./.test(size) ) {
            total = (total+1)|0;

            setTextSize(target, Math.round(size));

          }

        } catch(e) {
          //fontsize 12（初期設定）でテキストレイヤーを作った場合
          //textItem.sizeの値に何かが起きる模様（setterがバグってる？）
          //一度フォントサイズを操作すればエラーは出なくなるが、そのままだと
          //textItem.sizeとソースに書いただけで↓のエラーが出るため、tryで無かったことにする
          //INFO:CONSOLE(2)] "Uncaught SyntaxError: Unexpected token ILLEGAL"
        }

        i = (i+1)|0;
      }

    }

    if (documents.length !== 0 ) {

      layers = getLayersList();

      if ( layers.length ) {

        activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_DELETEFONTFLOAT %>", "deleteFontFloat(layers)");

         return '{value:"complete", total:' + total + ', type: "console"}';

      } else {
        return '{value:"notfound", total:0, type: "console"}';
      }
    }


  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();
