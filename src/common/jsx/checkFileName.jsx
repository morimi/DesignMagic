/**
 * @fileoverview activeDocument のファイル名チェック
 */

(function() {
  try {


  if ( documents.length > 0 ) {
    
    var reg = '<%= config.name[0] %>',
    reg2 = '<%= config.name[1] %>';

    var reg3 = new RegExp(reg, reg2),
        name = activeDocument.name.split('.')[0];

    if ( !name.match(reg3) ) {

      return '{status: 200, type: "error"}';

    } else {

      return '{status: 200, type: "valid"}';

    }
  } else {
      return '{status: 404}';
  }

  } catch(e) {
    return '{type: "jsx", message: "' + e + '", status: 500}';
  }

})();