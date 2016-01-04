/**
 * @fileoverview documentModeチェック
 */
(function() {
  
  try {

    if (documents.length > 0 ) {
      if (activeDocument.mode === DocumentMode["<%= config.documentModeType %>"]) {
        return '{value: "' + activeDocument.mode + '", type: "valid", status: 200}';

      } else {
        return '{value: "' + activeDocument.mode + '", type: "error", status: 200}';

      }
    } else {
      return '{status: 404}';
    }

  } catch(e) {
    return '{type: "jsx", message: "' + e + '", status: 500}';
  }

})();