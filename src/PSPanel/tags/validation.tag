<validation>

  <div id="validation" class="container"
    show="{this.parent.mode == 'check'}">
    <ul id="message-layers" class="list" if="{ layersMes.length }">

    <li class="message" each="{ layersMes }">
      <validation-message theme="{ parent.parent.theme }" id="{ this.id }" name="{this.title}"></validation-message>
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
    
    /**
     * クリックで選択されたメッセージのID
     */
    this.selectedId = 0;
    this.selectedIds = [];
    
    /**
     * check後のメッセージ総数
     */
    this.layersMesNum = 0;
    

    
    this.parent.on('confCache', function(data) {

      me.validation_info.innerHTML = (data && data.name) ? Strings.Pr_READY_TO_VALIDATION : Strings.Pr_SETTING_TO_URL

    });

    
    
    this.on('mount', function() {
      this.Storage.setStorage('selectedId');
      this.Storage.setStorage('selectedIds');
    })

    /**
     * update
     * バリデーション実行
     */
    this.on('update', function(mode, validation) {
      if ( mode != 'check' ) return;

      me.check()

    });
    
    //ドキュメント閉じた時
    //内容のリセットする
    csInterface.addEventListener( 'documentAfterDeactivate' , function() {
      me.reset();
    });
    
    
    /**
     * メッセージ選択イベント走ったとき
     * 選択されたIDを上書き格納、ID群は初期化
     */
    this.on('select', function(id) {
      me.selectedId = id;
      me.selectedIds = [];
      
      me.Storage.setStorage('selectedId', id);
      me.Storage.setStorage('selectedIds', []);
      
      //レイヤーパネルも選択状態にする
      me.RunJSX.selectLayer(id);
    });
    
    /**
     * 同じレイヤー名を持つメッセージのIDが発見されたら
     * trigger.pushIds 
     */
    this.on('pushIds', function(id) {
      
      //IDを格納
      me.selectedIds.push(id);
      me.Storage.setStorage('selectedIds', me.selectedIds);
      
      //レイヤーパネルの選択を増やす
      me.RunJSX.selectLayerAll(id);
      
    });
    
    
    this.on('afterNameChange', function(result) {
      
    });
    
  
    this.mixin('Storage');
    this.mixin('Validation');
    this.mixin('RunJSX');
  </script>

</validation>
