/**
 * @fileoverview 単位のチェック
 */

try {


if (preferences.rulerUnits !== Units["<%= config.rulserUnitsType %>"] ) {

  '{unit: "' + preferences.rulerUnits + '", type: "error"}';

} else {
  '{unit: "' + preferences.rulerUnits + '", type: "valid"}';
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
