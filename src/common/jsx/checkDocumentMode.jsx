/**
 * @fileoverview documentModeチェック
 */

try {

  if (documents.length > 0 ) {
    if (activeDocument.mode !== DocumentMode["<%= config.documentModeType %>"]) {

      '{ "value": "' + activeDocument.mode + '", "type": "error", "status": 200}';

    } else {

      '{ "value": "' + activeDocument.mode + '", "type": "valid", "status": 200}';

    }
  } else {
    '{ "status": 404}';
  }

} catch(e) {
  '{ "type": "jsx", "message": "' + e + '", "status": 500}';
}
