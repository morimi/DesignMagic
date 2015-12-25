
riot.mixin('RunJSX', { RunJSX: {
  
  stringToObject: function(str) {
    return (new Function("return " + str))();
  },
  
  /**
   *
   * @param {number} id
   */
  selectLayer: function(id) {
    JSXRunner.runJSX("selectLayer", {data: { id: id }}, function (result) {
      return result;
    });
  },
  
  /**
   *
   * @param {Array} ids
   */
  selectLayerAll: function(ids, callback) {
    var self = this;
    JSXRunner.runJSX("selectLayerAll", {data: {ids: ids }}, function (result) {
      if ( callback ) {
        callback(self.stringToObject(result));
      }
    });
  },
  
  
  changeLayerName: function(data, callback) {
    var self = this;
    
    JSXRunner.runJSX("changeLayerName", {data: data, Strings: Strings}, function (result) {
      if ( callback ) {
        callback(self.stringToObject(result));
      }
    });
    
  }
}})