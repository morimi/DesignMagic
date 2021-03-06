/**
 * @fileoverview activeDocument のファイルサイズチェック
 */

(function() {
  
  try {

    if (documents.length > 0 ) {
      var file = new File(activeDocument.fullName);
      var size = Math.round((file.length / 1000000) * 10) / 10;
      var limit = Math.abs('<%= config.size %>');

      if ( limit && size > limit ) {
        return '{"limit": ' + limit + ', "value":"' + size + '", "type": "warn", "status": 200}';

      } else if ( limit && size < limit ){
        return '{"limit": ' + limit + ', "value":"' + size + '", "type": "valid", "status": 200}';
      }
    } else {
       return '{"status": 404}';
    }

  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

}());