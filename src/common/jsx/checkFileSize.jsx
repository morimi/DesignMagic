/**
 * @fileoverview activeDocument のファイルサイズチェック
 */

(function() {
  try {

    if (documents.length > 0 ) {
      var obj = new File(activeDocument.fullName);
      var size = Math.round((obj.length / 1000000) * 10) / 10;
      var limit = Math.abs('<%= config.size %>');

      if ( limit && size > limit ) {
        return '{limit: "' + limit + '", value:"' + size + '", type: "warn"}';

      } else if ( limit && size < limit ){
        return '{limit: "' + limit + '", value:"' + size + '", type: "valid"}';
      }
    }

  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }

})();