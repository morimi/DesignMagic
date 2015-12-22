  /**
   * パネルからのレイヤー名変更する
   * @since version 0.4.0
   */
riot.mixin('ChangeLayerName', {
  
  /**
   * クリックされたli.messageのdata-idをキーに、同じ.titleテキストを持つli.message要素の配列を格納する
   * @type {{string:Array.<Object>}} li.message[data-id]:[<li.message>]
   */
  messages: {},
  
  
  /**
   * バリデーションメッセージがクリックされた時の処理
   * @param {MouseEvent} e 
   * @since version 0.4.0
   * @return {void}
   */
  onClickMessage: function(e, b) {
    this.isAllChangeLayerName = window.localStorage.getItem('com.cyberagent.designmagic:nameChangeAll') === 'true';
    
    // @type {HTML Element} div.message-data
    var el = e.target;
    //li.message el.parentElement
    //span.title el.parentElement.childNodes[1].childNodes[1].childNodes[5]
    
    console.log(el.parentElement.childNodes[1].childNodes[1].childNodes[5])
    
    
  }
});