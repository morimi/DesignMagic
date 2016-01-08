/**
 * @fileoverview レイヤー/グループ名の変更処理をする
 * @since version 0.4.0
 */
(function() {

  try {


    /**
     * 元の名前
     * @type {string}
     */
    var _baseName;


    /**
     * 新しい名前
     * @type {string}
     */
    var _newName = "<%= data.newName %>";


    /**
     * IDの配列
     * @type {Array.<number>}
     */
    var _ids = "<%= data.ids %>".split(',');


    /**
     * IDを渡された全てのレイヤー/グループ名を変更する
     * @param {Array.<number>} ids レイヤーID
     */
    function _changeAllLayerName(ids) {
      var i = 0, l = ids.length;

      while ( i < l ) {
        var id = parseInt(ids[i]);

        DM.changeLayerNameById(id, _newName);

        i = (i+1)|0;
      }
    }


  if (documents.length === 0 ) {
    return '{"status": 404}';
  }

  var aLayer = activeDocument.activeLayer;

  activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_CHANGELAYERNAME %>", "_changeAllLayerName(_ids)");

  activeDocument.activeLayer = aLayer;

  return '{ "status": 200, "total":' + _ids.length + ', "name": "<%= data.newName %>" }';


  } catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
  }

}());
