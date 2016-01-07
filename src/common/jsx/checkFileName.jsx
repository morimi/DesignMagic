/**
 * @fileoverview activeDocument のファイル名チェック
 */

(function() {
  
  try {
  
    if (documents.length > 0 ) {
      var reg = new RegExp('<%= config.name[0] %>', '<%= config.name[1] %>'),
          name = activeDocument.name.split('.')[0];

      if (! name.match(reg)) {

       return '{"type": "error", "status": 200}';

      } else {

       return '{"type": "valid", "status": 200}';

      }
    } else {
      return '{"status": 404}';
    }

  } catch(e) {
    return '{ "type": "jsx", "message": "' + e + '", "status": 500}';
  }

  
}());