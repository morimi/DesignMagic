<validation>

  <div id="validation" class="container"
    show="{this.parent.mode == 'check'}">
    <ul id="message-layers" class="list"></ul>
    <ul id="message-others" class="list">
       <li class="validation-info" id="validation_info" if="{ !othersMes.length }"></li>
       
       <li class="message" each="{ othersMes }" data-type="{ type }" data-id="{ id }" data-index="{ index }" data-hints="{ hintCodes }">
        <div class="message-wrapper">
          <p class="message-title">
            <img riot-src="images/icon/{ parent.parent.theme }/{ type }.png" width="14" height="14" class="icon { type } alert">
            <span class="title">{ title }</span>
          </p>
          <p class="message-hint" each="{ hi, i in hint }">{ hi }</p>
        </div>
      </li>
    </ul>
  </div>

  <script>
    console.info('------mount validation------')
    //this.root = <validation>
    //this.parent = <app>
    
    
    var me = this;
    
    
    
    this.parent.on('loadconf', function() {
      console.log('validation mount')
      //初期化時のお知らせメッセージをconf.jsonの読み込み状態に合わせてセットする
      me.validation_info.innerHTML = getConfig() ? Strings.Pr_READY_TO_VALIDATION : Strings.Pr_SETTING_TO_URL
    });
    
    
   /**
     * update
     * バリデーション実行
     */
    this.on('update', function(opt) {
      console.log('validation update');
      
     if ( ! getConfig() || (me.parent.mode != 'check') ) return;
      
      this.check(getConfig());
    });
    
    /**
     * appが持ってるconf.jsonを得る
     */
    function getConfig() {
      return me.parent.confCache;
    }


    
    this.mixin('Validation');
    
  </script>

</validation>
