<configs>
  <div id="config" class="container"
    show="{this.parent.mode == 'config' && this.parent.confCache }">

     <div id="config-list" class="list">

      <table class="config-base">
        <caption>{Strings.Pr_TITLE_BASEINFO}</caption>
        <tr>
          <th scope="row">{Strings.Pr_CONFIG_NAME}</th>
          <td>{this.parent.confCache.name}</td>
        </tr>
        <tr>
          <th scope="row">{Strings.Pr_CONFIG_VERSION}</th>
          <td>{this.parent.confCache.version}</td>
        </tr>
        <tr>
          <th scope="row">
          {Strings.Pr_CONFIG_URL}
          <a href="#setting" data-mode="setting">{Strings.Pr_BUTON_CHANGE}</a>
          </th>
          <td>{this.parent.confCache.url}</td>
        </tr>
      </table>
      
      <table each="{ category, sets in this.parent.confCache.check }">
        <caption>{ _.capitalize(category) }</caption>
        <tr each="{ prop, value in sets }">
          <th scope="row">
            <b category="{parent.category}" prop="{prop}"></b>
          </th>
          <td>{ value } </td>
        </tr>
      </table>
      
      <dl>
       <dt>{Strings.Pr_CONFIG_LAYERS_NAMING_LEVEL}</dt>
       <dd>{Strings.Pr_CONFIG_LAYERS_NAMING_LEVEL_0}</dd>
       <dd>{Strings.Pr_CONFIG_LAYERS_NAMING_LEVEL_1}</dd>
       <dd>{Strings.Pr_CONFIG_LAYERS_NAMING_LEVEL_2}</dd>
      </dl>

     </div>

    </div>
    
  <div id="setting" class="container"
    show="{ this.parent.mode == 'setting' || !this.parent.confCache }">
     
      <div id="setting-list" class="list">
        <div id="setting-form">
         <p>{Strings.Pr_INPUT_TO_CONFIG_URL}</p>
          <p>URL:<input type="text" class="topcoat-text-input--large" id="input-config-url" style="width:100%" onkeyup="{ onChangeInputUrl }"></p>
          <p>{Strings.Pr_SELECT_LOCAL_CONFIG_FILE}</p>
          <p><input type="file" accept="application/json" class="topcoat-text-input--large" id="select-config-file" style="width:100%" onchange="{ onChangeSelectFile }"></p>
          
          <p class="error-message" if="{ errorMessage }">
            { errorMessage }
          </p>
          <p>
          <!--キャンセルボタン-->
          <a href="#config" class="js-btn-cancel topcoat-button--large">{Strings.Pr_BUTTON_CANCEL}</a>
          <!--設定するボタン-->
          <button class="topcoat-button--large js-btn-setting" type="button" onclick="{ onClickUrlSetting }">{Strings.Pr_BUTTON_SETTING}</button>
          </p>
          <p style="margin-top: 20px"><button id="resetButton" class="js-btn-reset topcoat-button--large" type="button">{Strings.Pr_BUTTON_RESET}</button></p>
        </div>
      </div>
   
    </div>

  <script>


    console.info('------mount configs------');
    
    
    var me = this;
    
    this.newUrl = null;
    
    /**
     * エラーメッセージ
     */
    this.errorMessage = null;
    
  
    riot.tag('b', '', function(opts) {
        this.root.innerHTML = Strings['Pr_CONFIG_' + opts.category.toUpperCase() + '_' + _.snakeCase(opts.prop).toUpperCase()];
    });
    
    
    onChangeInputUrl(e) {
      this.newUrl = e.currentTarget.value;
    };
    
    onChangeSelectFile(e) {
      this.parent.localConfFile = e.target.files.item(0); // FileList -> File object
      console.info('ローカルのconf.jsonファイルが選択されました');
    };
    
    /**
     * 設定するボタン押したとき
     */
    onClickUrlSetting(e) {
      console.log('[onClickUrlSetting]', this.newUrl, this.parent.localConfFile);
      
     if ( !this.newUrl && ! this.parent.localConfFile ) {
       this.errorMessage = 'ファイルが指定されていません';
       console.log('conf.jsonのURLもローカルのconf.jsonファイルも指定されていません');
       return;
     }
      
      //リモートのconfigファイルが指定された
      if ( _.isString(this.newUrl) && this.newUrl.match(/^(http|https)/) ) {
        console.info('conf.jsonのURLを新しく設定します');
        window.localStorage.setItem('com.cyberagent.designmagic:conf.url', this.newUrl);
        window.localStorage.removeItem('com.cyberagent.designmagic:conf.result');

      }
      
      //ローカルのconfigファイル
      if ( _.isObject(this.parent.localConfFile) ) {
        console.info('conf.jsonのURLをlocalhostに設定します');
        window.localStorage.setItem('com.cyberagent.designmagic:conf.url', 'localhost');
      }
      
      
      Q.fcall(this.parent.loadConfig)
       .done(function(data) {
          console.log('( ﾟдﾟ)ﾊｯ!', data);
          me.newUrl = null;
        
          if ( !data ) {
            me.update({errorMessage: 'conf.jsonの取得に失敗しました'});
          
          } else {
            me.parent.update();
          }
        
        
       });
      
    };
    
    
  

  </script>
</configs>