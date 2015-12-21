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

      return '{value: "' + activeDocument.width + '", type: "error"}';

    } else {

      return '{value: "' + activeDocument.width + '", type: "valid"}';

    }
  }

  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }
})();
