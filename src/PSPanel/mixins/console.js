
riot.mixin('Console', {

  setConsoleMessage: function(txt) {
    if ( this.parent ) {
      this.parent.tags.footer.update({message: txt});
    } else {
      this.tags.footer.update({message: txt});  
    }
  },

  /**
  * 
  * @method setConsole
  * @param {Object} data
  */
  setConsole: function(data) {
    var footer = this.getFooter();
    
    footer.update(data);
  },
  
  getExecTime: function(start) {
    return Math.abs((start - Date.now()) / 1000) + 's'
  },
     
  getFooter: function() {

      var footer;

      function _traverse(parent) {
        
        if (parent.root.tagName !== 'APP') {
          _traverse(parent.parent);
        }
        
        if (parent.root.tagName === 'APP') {
          footer = parent.tags.footer;
        }
        
      }

      _traverse(this.parent);

      return footer;
    
    }
});