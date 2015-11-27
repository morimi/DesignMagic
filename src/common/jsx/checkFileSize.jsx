/**
 * @fileoverview activeDocument のファイルサイズチェック
 */

try {

if (documents.length > 0 ) {
  var obj = new File(activeDocument.fullName);
  var size = Math.round((obj.length / 1000000) * 10) / 10;
  var limit = Math.abs('<%= config.size %>');

  if ( limit && size > limit ) {
    '{limit: "' + limit + '", value:"' + size + '", type: "warn"}';

  } else if ( limit && size < limit ){
    '{limit: "' + limit + '", value:"' + size + '", type: "valid"}';
  }
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
