<validation>

  <div id="validation" class="container"
    show="{this.parent.mode == 'check'}">
    <ul id="message-layers" class="list" if="{ layersMes.length }">

      <li class="message" each="{ layersMes }" data-type="{ type }" data-id="{ id }" data-index="{ index }" data-hints="{ hintCodes }">
        <div class="message-wrapper">
          <p class="message-title">
            <img riot-src="images/icon/{ parent.parent.theme }/{ type }.png" width="14" height="14" class="icon { type } alert">
            <img if="{ kind }" riot-src="images/icon/{ parent.parent.theme }/{ kind }.png" width="14" height="14" class="icon kind">
            <span class="title">{ title }</span>
          </p>
          <p class="message-hint" each="{ hi, i in hint }">{ hi }</p>
        </div>
      </li>

    </ul>
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

    console.info('------mount validation------');
    //this.root = <validation>
    //this.parent = <app>
    var me = this;


    this.parent.on('confCache', function(data) {

      me.validation_info.innerHTML = (data && data.name) ? Strings.Pr_READY_TO_VALIDATION : Strings.Pr_SETTING_TO_URL

    });


    this.on('update', function(mode, validation) {
      if ( mode != 'check' ) return;

      me.check()

    });
    
    //ドキュメント閉じた時
    csInterface.addEventListener( 'documentAfterDeactivate' , this.reset);

    this.mixin('Validation');
  </script>

</validation>
