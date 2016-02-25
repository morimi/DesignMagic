/**
 * @fileoverview レイヤー/グループを選択する
 * idを使用する
 * data = { id: number }
 * @since version 0.4.0
 */

(function() {
  
  try {

    if (documents.length !== 0 ) {
      
      var id = parseInt("<%= id %>");

      DM.selectLayerById(id)


      return '{"status": 200}';
      
    } else {
      return '{"status": 404}';
    }

  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

}());