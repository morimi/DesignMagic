/**
 * @fileoverview LayerCompsのチェック
 */

try {

if (documents.length > 0 ) {
  if ( activeDocument.layerComps.length ) {
    var n;

    for (var i = 0; i < activeDocument.layerComps.length; i++ ) {
      var comp = activeDocument.layerComps[i];
      if ( comp.selected ) {
        n = comp.name;
      }
    }

    '{title: "レイヤーカンプが設定されています", hint: ["「' + n + '」が選択されています"], type: "valid"}';

  } else {

    '{title: "レイヤーカンプが設定されていません", hint: ["「レイヤーカンプ」パネルで設定できます"], type: "warn"}';

  }
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
