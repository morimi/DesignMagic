<tools>
  <div id="tools" class="container"
    show="{this.parent.mode == 'tools'}">
      <div id="tools-list" class="list">
       <!--{Strings.Pr_TOOLS_ATTENTION}-->
        <p><string category="TOOLS" prop="ATTENTION"></string></p>
         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_DELETECOPYTEXT}
             <button class="topcoat-button--large pull-r js-tools-deleteCopyText" type="button" onclick="{ onDeleteCopyText }">{Strings.Pr_BUTTON_EXECUTE}</button>
           </dt>
           <dd>
            <!--{Strings.Pr_DESCRIPTION_DELETECOPYTEXT}-->
             <string category="DESCRIPTION" prop="DELETECOPYTEXT"></string>
           </dd>
         </dl>

         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_DELETEFONTFLOAT}
             <button class="topcoat-button--large pull-r js-tools-deleteFontFloat" type="button" onclick="{ onDeleteFontFloat }">{Strings.Pr_BUTTON_EXECUTE}</button>
           </dt>
           <dd>
            <!--{Strings.Pr_DESCRIPTION_DELETEFONTFLOAT}-->
             <string category="DESCRIPTION" prop="DELETEFONTFLOAT"></string>
           </dd>
         </dl>

         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_DELETEHIDDENLAYER}
             <button class="topcoat-button--large pull-r js-tools-deleteHiddenLayer" type="button" onclick="{ onDeleteHiddenLayer }">{Strings.Pr_BUTTON_EXECUTE}</button>
           </dt>
           <dd>
             <!--{Strings.Pr_DESCRIPTION_DELETEHIDDENLAYER}-->
             <string category="DESCRIPTION" prop="DELETEHIDDENLAYER"></string>
           </dd>
         </dl>

         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_CREATEDUMMYLAYER}
             <button class="topcoat-button--large pull-r js-tools-createDummyLayer" type="button" onclick="{ onCreateDummyLayer }">{Strings.Pr_BUTTON_EXECUTE}</button>
           </dt>
           <dd>
              <!--{Strings.Pr_DESCRIPTION_CREATEDUMMYLAYER}-->
             <string category="DESCRIPTION" prop="CREATEDUMMYLAYER"></string>
           </dd>
         </dl>

      </div>

    </div>


  <script>

    console.info('------mount tools------')
    
    var me = this;
    var app = this.parent;

    /**
     * ダミーレイヤーの作成
     * @since version 0.4.0
     */
    onCreateDummyLayer() {
      var start = Date.now();
      console.log('（＾ω＾）createDummyLayer start');
      
      me.parent.trigger('toolStart', {message: Strings.Pr_START_CREATEDUMMYLAYER});
     
      JSXRunner.runJSX("createDummyLayer", {Strings: Strings}, function (result) {
        var obj = JSON.parse(result);
        var time = start - Date.now();
        
      console.log('（＾ω＾）createDummyLayer end', obj);
        
        switch ( obj.status ) {
          case 200:
            me.parent.trigger('toolEnd', {message: Strings.Pr_COMPLETE_CREATEDUMMYLAYER,
                                          time: time});
            break;
            
          case 404:
            me.parent.trigger('toolEnd', {message: Strings.Pr_NODOCUMENT_CREATEDUMMYLAYER,
                                         time: time});
            break;
            
          default:
            me.parent.trigger('toolEnd', {message: Strings.Pr_ERROR_TOOLS,
                                         time: time});
        } 
      });
    }
    
    /**
     * 非表示レイヤーを消す
     */
    onDeleteHiddenLayer() {
            var start = Date.now();
      console.log('（＾ω＾）DeleteHiddenLayer start');
      
      me.parent.trigger('toolStart', {message: Strings.Pr_START_DELETEHIDDENLAYER});
     
      JSXRunner.runJSX("deleteHiddenLayer", {Strings: Strings}, function (result) {
        var obj = JSON.parse(result);
        var time = start - Date.now();
        
      console.log('（＾ω＾）DeleteHiddenLayer end', obj);
        
        switch ( obj.status ) {
          case 200:
            var message = Strings.formatStr(Strings.Pr_COMPLETE_DELETEHIDDENLAYER, obj.layers, obj.total);
            var hidden = app.tags.header.hiddenVal - obj.total;
            
            if ( !obj.total ) {
              message = Strings.Pr_NOTFOUND_DELETEHIDDENLAYER;
            }
            
            me.parent.trigger('toolEnd', {message: message, time: time, hiddenVal: hidden});
            
            break;
            
          case 404:
            me.parent.trigger('toolEnd', {message: Strings.Pr_NODOCUMENT_CREATEDUMMYLAYER,
                                         time: time});
            break;
            
          default:
            me.parent.trigger('toolEnd', {message: Strings.Pr_ERROR_TOOLS,
                                         time: time});
        } 
      });
    }
    
    /**
     * 小数点削除
     */
    onDeleteFontFloat() {
            var start = Date.now();
      console.log('（＾ω＾）DeleteFontFloat start');
      
      me.parent.trigger('toolStart', {message: Strings.Pr_START_DELETEFONTFLOAT});
     
      JSXRunner.runJSX("deleteFontFloat", {Strings: Strings}, function (result) {
        var obj = JSON.parse(result);
        var time = start - Date.now();
        
      console.log('（＾ω＾）DeleteFontFloat end', obj);
        
        switch ( obj.status ) {
          case 200:
            var message = Strings.formatStr(Strings.Pr_COMPLETE_DELETEFONTFLOAT, obj.layers, obj.total);
            
            if ( !obj.total ) {
              message = Strings.Pr_NOTFOUND_DELETEFONTFLOAT;
            }
            
            me.parent.trigger('toolEnd', {message: message, time: time});
            
            break;
            
          case 404:
            me.parent.trigger('toolEnd', {message: Strings.Pr_NODOCUMENT_CREATEDUMMYLAYER,
                                         time: time});
            break;
            
          default:
            me.parent.trigger('toolEnd', {message: Strings.Pr_ERROR_TOOLS,
                                         time: time});
        } 
      });
    }
    
    /**
     * 〜のコピー削除
     */
    onDeleteCopyText() {
            var start = Date.now();
      console.log('（＾ω＾）DeleteCopyText start');
      
      me.parent.trigger('toolStart', {message: Strings.Pr_START_DELETECOPYTEXT});
     
      JSXRunner.runJSX("deleteCopyText", {Strings: Strings}, function (result) {
        var obj = JSON.parse(result);
        var time = start - Date.now();
        
      console.log('（＾ω＾）DeleteCopyText end', obj);
        
        switch ( obj.status ) {
          case 200:
            var message = Strings.formatStr(Strings.Pr_COMPLETE_DELETECOPYTEXT, obj.total);
            
            if ( !obj.total ) {
              message = Strings.Pr_NOTFOUND_DELETECOPYTEXT;
            }
            
            me.parent.trigger('toolEnd', {message: message, time: time});
            
            break;
            
          case 404:
            me.parent.trigger('toolEnd', {message: Strings.Pr_NODOCUMENT_CREATEDUMMYLAYER,
                                         time: time});
            break;
            
          default:
            me.parent.trigger('toolEnd', {message: Strings.Pr_ERROR_TOOLS,
                                         time: time});
        } 
      });
    }
    
  </script>
</tools>

