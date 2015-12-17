<configs>
  <div id="config" class="container"
    show="{this.parent.mode == 'config'}">

     <div id="config-list" class="list">

      <table class="config-base">
        <caption>{Strings.Pr_TITLE_BASEINFO}</caption>
        <tr>
          <th scope="row">{Strings.Pr_CONFIG_NAME}</th>
          <td>{DM.vm.confCache.name}</td>
        </tr>
        <tr>
          <th scope="row">{Strings.Pr_CONFIG_VERSION}</th>
          <td>{DM.vm.confCache.version}</td>
        </tr>
        <tr>
          <th scope="row">
          {Strings.Pr_CONFIG_URL}
          <a href="#" data-mode="setting" onclick="{DM.switchContainer}">{Strings.Pr_BUTON_CHANGE}</a>
          </th>
          <td>{DM.vm.confCache.version}</td>
        </tr>
      </table>

     </div>

    </div>
  <div id="setting" class="container"
    show="{this.parent.mode == 'setting'}"></div>

  <script>

    var me = this

    console.info('------mount configs------')

  </script>
</configs>
