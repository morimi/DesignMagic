riot.mixin('Loading', {
  
  init: function() {
    
  },
  
  showLoading: function() {
    if ( this.parent ) {
      this.parent.tags.header.update({loading: true});
    } else {
      this.tags.header.update({loading: true});
    }
    
  },
  
  hideLoading: function() {
    if ( this.parent ) {
      this.parent.tags.header.update({loading: false});
    } else {
      this.tags.header.update({loading: false});
    }
  }
  
  
});