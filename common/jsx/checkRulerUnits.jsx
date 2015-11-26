/**
 * @fileoverview 単位のチェック
 */

try {


if (preferences.rulerUnits !== Units["<%= config.rulserUnitsType %>"] ) {

  '{value: "' + preferences.rulerUnits + '", type: "error"}';

} else {
  '{value: "' + preferences.rulerUnits + '", type: "valid"}';
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
