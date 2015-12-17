<validation>

  <div id="validation" class="container"
    show="{this.parent.mode == 'check'}">
    <ul id="message-layers" class="list"></ul>
    <ul id="message-others" class="list">
       <li class="validation-info" id="validation_info"></li>
    </ul>
  </div>

  <script>

    console.info('------mount validation------')
    //this.root = <validation>
    //this.parent = <app>
    var me = this;


    this.parent.vm.on('confCache', function(data) {

      me.validation_info.innerHTML = (data && data.name) ? Strings.Pr_READY_TO_VALIDATION : Strings.Pr_SETTING_TO_URL

    })

  </script>

</validation>
