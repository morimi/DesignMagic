/**
 * @fileoverview documentModeチェック
 */

try {

function checkMode() {
  if (activeDocument.mode !== DocumentMode["<%= config.documentModeType %>"]) {

    return '{value: "' + activeDocument.mode + '", type: "error"}';

  } else {

    return '{value: "' + activeDocument.mode + '", type: "valid"}';

  }

}

if (documents.length > 0 ) {
  checkMode();
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
