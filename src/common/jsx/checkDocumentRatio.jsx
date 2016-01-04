/**
 * @fileoverview Ratioチェック
 *
 * activgeDocumentの幅(width)で判定する
 * check.files.ratio
 * 1 -> 320
 * 2 -> 640
 * 3 -> 960
 * 4 -> 1280
 */

(function() {
  
  try {

  var RATIO = parseFloat('<%= config.ratio %>'),
      value = RATIO * 320;

  if ( documents.length > 0 ) {
    if ( activeDocument.width !== value ) {

      return '{value: "' + activeDocument.width + '", type: "error", status: 200}';

    } else {

      return '{value: "' + activeDocument.width + '", type: "valid", status: 200}';

    }
  } else {
    return '{status: 404}';
  }

  } catch(e) {
    return '{type: "jsx", message: "' + e + '", status: 500}';
  }
})();
