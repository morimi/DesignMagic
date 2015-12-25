riot.mixin('Util', {
  
  /**
   * ボタンイベントハンドラ
   * data-modeの値 'check', 'config', 'tools', 'change' を mode イベント トリガーに渡す
   * this.parent = <app>
   * @param {MouseEvent} e
   */
  switchContainer: function(e) {
    var mode = e.currentTarget.getAttribute('data-mode')
    if ( this.parent ) {
      this.parent.trigger('mode', mode)
    }
  }
  
  
});