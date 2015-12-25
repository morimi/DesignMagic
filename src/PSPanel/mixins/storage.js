

riot.mixin('Storage', { Storage: {
  
  _storages: {},
  
  setStorage: function(name, val) {
    this._storages[name] = val || '';
  },
  
  getStorage: function(name) {
    return this._storages[name];
  }
  
} });