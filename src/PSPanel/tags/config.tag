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
            <string category="CONFIG_{parent.category}" prop="{prop}"></string>
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

      <hr>

     <!--オプション-->
      <dl>
        <dt>{Strings.Pr_CONFIG_OPTION}</dt>
        <dd>
          <label class="topcoat-checkbox">
            <input type="checkbox" class="js-is-autocheck" onchange="{ onChangeAutoSave }" __checked="{ isAutoCheck }">
            <div class="topcoat-checkbox__checkmark"></div>
            {Strings.Pr_CONFIG_OPTION_AUTOSAVE}
          </label>
        </dd>
        <dd>
          <label class="topcoat-checkbox">
            <input type="checkbox" class="js-nameChangeAll" onchange="{ onChangeNameAll }" __checked="{ isNameChangeAll }">
            <div class="topcoat-checkbox__checkmark"></div>
            同じ名前のレイヤー/グループを全て変更対象にする
          </label>
        </dd>

      </dl>
      
      <hr>
      <!--説明-->
        <dl>
          <dt>{Strings.Pr_NOTE_ICONS}</dt>
          <dd><img src="images/icon/{this.parent.theme}/error.png" width="14" height="14" class="icon" alt=""> {Strings.Pr_NOTE_ICONS_ERROR}</dd>
          <dd><img src="images/icon/{this.parent.theme}/warn.png" width="14" height="14" class="icon" alt=""> {Strings.Pr_NOTE_ICONS_WARN}</dd>
          <dd><img src="images/icon/{this.parent.theme}/eye.png" width="14" height="14" class="icon" alt=""> {Strings.Pr_NOTE_ICONS_EYE}</dd>
        </dl>
        <hr>
        <!-- ユーザーID -->
          <dl>
            <dt>{Strings.Pr_USER_ID}</dt>
            <dd>{userId}</dd>
          </dl>
     </div>
     

    </div>
    
  <div id="setting" class="container"
    show="{ this.parent.mode == 'setting' || this.parent.mode == 'config' && !this.parent.confCache }">
     
      <div id="setting-list" class="list">
       
        <p class="error-message" if="{ errorMessage }">
          { errorMessage }
        </p>
        
        <div id="setting-form">
         <p>{Strings.Pr_INPUT_TO_CONFIG_URL}</p>
          <p>URL:<input type="text" class="topcoat-text-input--large" id="input-config-url" style="width:100%" onkeyup="{ onChangeInputUrl }"></p>
          <p>{Strings.Pr_SELECT_LOCAL_CONFIG_FILE}</p>
          <p><input type="file" accept="application/json" class="topcoat-text-input--large" id="select-config-file" name="select" style="width:100%" onchange="{ onChangeSelectFile }"></p>
          
          <p>
          <!--キャンセルボタン-->
          <a href="#config" class="js-btn-cancel topcoat-button--large">{Strings.Pr_BUTTON_CANCEL}</a>
          <!--設定するボタン-->
          <button class="topcoat-button--large js-btn-setting" type="button" onclick="{ onClickUrlSetting }">{Strings.Pr_BUTTON_SETTING}</button>
          </p>
          <p style="margin-top: 20px"><button id="resetButton" class="js-btn-reset topcoat-button--large" type="button" onclick="{ onClickReset }">{Strings.Pr_BUTTON_RESET}</button></p>
        </div>
      </div>
   
    </div>

  <script>


    console.info('------mount configs------');
    
    
    var me = this;
    
    /**
     * 新しいURL
     * @type {string}
     */
    this.newUrl = null;

    /**
     * 同じ名前のレイヤーを全て対象にする
     */
    this.userId = window.localStorage.getItem('com.cyberagent.designmagic:analytics.userId');

    /**
     * 自動でチェックするかどうかフラグ
     */
    this.isAutoCheck = window.localStorage.getItem('com.cyberagent.designmagic:autocheck') === 'true';
    
    /**
     * 同じ名前のレイヤーを全て対象にする
     */
    this.isNameChangeAll = window.localStorage.getItem('com.cyberagent.designmagic:nameChangeAll') === 'true';
    
    /**
     * エラーメッセージ
     */
    this.errorMessage = null;
    
    
    this.on('mount', function() {
      this.$inputConfUrl = document.getElementById('input-config-url');
      this.$selectConfFile = document.getElementById('select-config-file');
    })
    
    
    onChangeInputUrl(e) {
      this.errorMessage = null;
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
      this.newUrl = me.$inputConfUrl.value;
      
      console.log('[onClickUrlSetting]', this.newUrl, this.parent.localConfFile);
      
      
     if ( !this.newUrl && ! this.parent.localConfFile ) {
       this.errorMessage = 'ファイルが指定されていません';
       console.log('conf.jsonのURLもローカルのconf.jsonファイルも指定されていません');
       return;
     }
      
      this.parent.resetConfigCache();
      
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
       .fail(function(data){
        console.log('faild', data)
      })
       .done(function(data) {
          console.log('( ﾟдﾟ)ﾊｯ!', data);
          me.newUrl = null;
          me.$inputConfUrl.value = null;
        
          if ( !data ) {
            me.update({errorMessage: 'conf.jsonの取得に失敗しました'});
          
          } else {
            riot.route('config');
            me.update();
          }
        
        
       });
      
    };
    
    /**
     * リセット
     */
    onClickReset() {
      this.parent.trigger('reset');
      this.errorMessage = '設定をリセットしました';
      this.$inputConfUrl.value = null;
      this.$selectConfFile.value = null;
    }
    
    
    /**
     * 保存したとき自動チェックオプションがクリックされた
     */
    onChangeAutoSave(e) {
      var checked = e.target.checked;
      
      window.localStorage.setItem('com.cyberagent.designmagic:autocheck', checked);
      
      if ( checked ) {
        csInterface.addEventListener( 'documentAfterSave' , this.parent.handleAutoCheck);
      } else {
        csInterface.removeEventListener( 'documentAfterSave' , this.parent.handleAutoCheck);
      }
    };
    
    /**
     * 同じ名前のレイヤーを全て変更対象にする
     */
    onChangeNameAll(e) {
      var checked = e.target.checked;
      window.localStorage.setItem('com.cyberagent.designmagic:nameChangeAll', checked);
    };
    
  

  </script>
</configs>