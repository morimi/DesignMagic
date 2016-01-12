<tools>
  <div id="tools" class="container"
    show="{this.parent.mode == 'tools'}">
      <div id="tools-list" class="list">
       <!--{Strings.Pr_TOOLS_ATTENTION}-->
        <p><string category="TOOLS" prop="ATTENTION"></string></p>
         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_DELETECOPYTEXT}
             <button class="topcoat-button--large pull-r js-tools-deleteCopyText" type="button">{Strings.Pr_BUTTON_EXECUTE}</button>
           </dt>
           <dd>
            <!--{Strings.Pr_DESCRIPTION_DELETECOPYTEXT}-->
             <string category="DESCRIPTION" prop="DELETECOPYTEXT"></string>
           </dd>
         </dl>

         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_DELETEFONTFLOAT}
             <button class="topcoat-button--large pull-r js-tools-deleteFontFloat" type="button">{Strings.Pr_BUTTON_EXECUTE}</button>
           </dt>
           <dd>
            <!--{Strings.Pr_DESCRIPTION_DELETEFONTFLOAT}-->
             <string category="DESCRIPTION" prop="DELETEFONTFLOAT"></string>
           </dd>
         </dl>

         <dl>
           <dt class="clearfix">{Strings.Pr_HISTORY_DELETEHIDDENLAYER}
             <button class="topcoat-button--large pull-r js-tools-deleteHiddenLayer" type="button">{Strings.Pr_BUTTON_EXECUTE}</button>
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
        console.log(obj)
      });
    }
    
  </script>
</tools>

