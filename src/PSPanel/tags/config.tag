<configs>
  <div id="config" class="container"
    show="{this.parent.mode == 'config'}">

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
          <a href="#" data-mode="setting" onclick="{DM.switchContainer}">{Strings.Pr_BUTON_CHANGE}</a>
          </th>
          <td>{this.parent.confCache.url}</td>
        </tr>
      </table>
      
      <table each="{ category, sets in this.parent.confCache.check }">
        <caption>{ _.capitalize(category) }</caption>
        <tr each="{ prop, value in sets }">
          <th scope="row"> <b category="{parent.category}" prop="{prop}"></b> </th>
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
    show="{this.parent.mode == 'setting'}">
     
      <div id="setting-list" class="list">
        <div id="setting-form">
         <p>{Strings.Pr_INPUT_TO_CONFIG_URL}</p>
          <p>URL:<input type="text" class="topcoat-text-input--large" id="input-config-url" style="width:100%"></p>
          <p>{Strings.Pr_SELECT_LOCAL_CONFIG_FILE}</p>
          <p><input type="file" accept="application/json" class="topcoat-text-input--large" id="select-config-file" style="width:100%"></p>
          <p>
          <button class="js-btn-cancel topcoat-button--large" type="button">{Strings.Pr_BUTTON_CANCEL}</button>
          <button class="topcoat-button--large js-btn-setting" type="button">{Strings.Pr_BUTTON_SETTING}</button>
          </p>
          <p style="margin-top: 20px"><button id="resetButton" class="js-btn-reset topcoat-button--large" type="button">{Strings.Pr_BUTTON_RESET}</button></p>
        </div>
      </div>
   
    </div>

  <script>

    var me = this

    console.info('------mount configs------')
    
    riot.tag('b', '', function(opts) {
        this.root.innerHTML = Strings['Pr_CONFIG_' + opts.category.toUpperCase() + '_' + _.snakeCase(opts.prop).toUpperCase()];
    });

  </script>
</configs>
