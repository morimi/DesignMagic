<validation-message>
 
  <div class="message-wrapper {selected:selected}">
    <p class="message-title">
      <img riot-src="images/icon/{ opts.theme }/{ type }.png" width="14" height="14" class="icon { type } alert">
      <img if="{ kind }" riot-src="images/icon/{ opts.theme }/{ kind }.png" width="14" height="14" class="icon kind">
      <span class="title">{ title }</span>
    </p>
    <p class="message-hint" each="{ hi, i in hint }">{ hi }</p>
  </div>
  
  <div class="message-data" data-type="{ type }" data-id="{ id }" data-index="{ index }" data-hints="{ hintCodes }" onclick="{ toggle }"></div>


<script>
  
  var me = this;
  
  this.selected = opts.selected || false;
  
  this.isAllChangeLayerName = window.localStorage.getItem('com.cyberagent.designmagic:nameChangeAll') === 'true';
    
  /**
   * バリデーションメッセージがクリックされた時の処理
   * @param {MouseEvent} e 
   * @since version 0.4.0
   * @return {void}
   */
  
  toggle(e) {
    // @type {HTML Element} div.message-data
    //var el = e.target;
    //li.message el.parentElement
    //span.title el.parentElement.childNodes[1].childNodes[1].childNodes[5]
    
    
    this.selected = !this.selected;
    this.parent.trigger('toggle', this.opts.id);
  }
  
  
  
  this.parent.on('select', function(id) {
    
    if ( id !== me.opts.id ) {
      me.selected = false;
    }

  })

  
</script>

</validation-message>