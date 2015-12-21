/**
 * @fileoverview documentModeチェック
 */
(function() {
  
  try {

    if (documents.length > 0 ) {
      if (activeDocument.mode === DocumentMode["<%= config.documentModeType %>"]) {
        return '{value: "' + activeDocument.mode + '", type: "valid"}';

      } else {
        return '{value: "' + activeDocument.mode + '", type: "error"}';

      }
    } else {
      return '{value: "404", type: "error"}';
    }

  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();