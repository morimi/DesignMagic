
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
    if ( this.parent ) {
     this.parent.tags.footer.update(data);  
    } else {
      this.tags.footer.update(data);  
    }
  }
});