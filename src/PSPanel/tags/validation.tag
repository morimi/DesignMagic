<validation>

  <div id="validation" class="container"
    show="{this.parent.mode == 'check'}">
    
    <ul id="message-layers" class="list" if="{ layersMes.length }">
      
       <li class="message" each="{ layersMes.filter(messageFilter) }" onclick="{ onClickMessage }" ondblclick="{ onDblClickMessage }">
         <div class="message-wrapper {selected:selected}">
          <p class="message-title">
            <img riot-src="images/icon/{ theme }/{ type }.png" width="14" height="14" class="icon { type } alert">
            <img if="{ kind }" riot-src="images/icon/{ theme }/{ kind }.png" width="14" height="14" class="icon kind { visible }" onclick="{ onClickKind }">
            <span class="title {change:changeName}" if="{ !showForm }">{ title }</span>
            <nameForm value="{title}" if="{ showForm }" showForm="{ showForm }"></nameForm>
          </p>
          <p class="message-hint" each="{ hint }">
            { text }
          </p>
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
    console.info('------mount validation------')
    //this.root = <validation>
    //this.parent = <app>
    
    
    var me = this;
    var app = this.parent;
    
    
    /**
     * 処理中の場合 true 
     */
    this.processing = false;

    
    /**
     * 選択されたメッセージ
     */
    this.selectedItem = null;
    
    
    /**
     * selectedItemと同じレイヤー名のメッセージID配列
     * @type {Array.<number>}
     */
    this.selectedIds = [];
    
    
    /**
     * バリデーションメッセージがクリックされた時の処理
     * レイヤーパネルも選択状態にする
     * @param {MouseEvent} e イベントオブジェクト
     * @return {void}
     */
    onClickMessage(e) {
      
      /**
       * クリックされたメッセージデータ
       * @type {Object}
       */
      var item = e.item;
      
      
      if ( this.processing || this.selectedItem && this.selectedItem.id === item.id ) return;
      
      //this.processing = true;
      
      console.log('onClickMessage');
      
      /**
       * 同じレイヤー名がほかに存在する時まとめて変更するかどうか
       * true: 変更する
       * @type {boolean}
       */
      this.isAllChangeLayerName = window.localStorage.getItem('com.cyberagent.designmagic:nameChangeAll') === 'true';
            
      /**
       * メッセージの選択状態
       * １回目クリックでtrue
       * @type {boolean}
       */   
      item.selected = true;
      

      //item保存
      this.selectedItem = item;
      
      
      this.selectedIds.length = 0;
      
      
      //レイヤーパネルも選択状態にする
      JSXRunner.runJSX("selectLayer", { id: item.id }, function (result) {
        console.log('End selectLayer', result);
        me.processing = false;
      });

    };
    
    /**
     * Kindアイコンがクリックされた時の処理
     */
    onClickKind(e) {
      var item = e.item;
      
      var action = item.visible || 'hidden';
      
      JSXRunner.runJSX("visible", { id: e.item.id, action: action }, function (result) {
        item.visible = (action === 'hidden') ? 'show':'hidden';
        item = null;
        console.log('End visible', result)
      });
      
    }
    
    /**
     * eachされるメッセージのフィルタリング
     * @param {Object} item メッセージデータ
     */
    messageFilter(item) {
      
      if (! me.selectedItem ) {
         return item;
      }

      //自身のIDと比較して選択状態を変更
      if ( this.selectedItem.id != item.id ) {
        item.selected = false;
        item.changeName = false;
        item.showForm = false;
      }

      //同じレイヤー名を持つメッセージのIDが発見されたら（オプションでONになってる場合）
      if (this.selectedItem.title == item.title && this.isAllChangeLayerName) {
        item.changeName = true;

        //保管済みIDでないかチェックして
        if ( this.selectedIds.indexOf(item.id) === -1) {
          //IDを保存しておく
          this.selectedIds.push(item.id);
        }
      }

      return item;
    };
    
    
   /**
     * メッセージがダブルクリックされたときのイベントハンドラ
     * レイヤー名変更用のテキストエリアを表示する
     * isAllChangeLayerName == trueの場合は同じレイヤー名をもつレイヤーを選択状態にする
     * @param {MouseEvent} e イベントオブジェクト
     */
     onDblClickMessage(e) {
       if ( this.processing ) return;
       
       this.processing = true;
       
       e.item.changeName = true;
       e.item.showForm = true;
       
       //同じ名前のIDを全て対象にするオプションがOFFだと、
       //messageFilterでselectedIdsにidが追加されないのでここで追加しておく
       if ( !this.isAllChangeLayerName ) {
         me.selectedIds.push(e.item.id);
       }

      //レイヤーパネルの選択を増やす
      JSXRunner.runJSX("selectLayerAll", {ids: me.selectedIds }, function (result) {
        me.processing = false;
        return result;
      });
    };
    
    
    //初期化時のお知らせメッセージをconf.jsonの読み込み状態に合わせてセットする
    this.setValidationInfo = function () {
      me.validation_info.innerHTML = getConfig() ? Strings.Pr_READY_TO_VALIDATION : Strings.Pr_SETTING_TO_URL;
    };
    
    
    /**
     * conf.js読み込み終わったとき
     */
    this.parent.on('loadconf', function(c) {
      console.log('<validation> on loadconf');
      
      me.setValidationInfo();
      
      //JSXの共通関数読み込んでおく
      JSXRunner.runJSX("designMagic", {config: c.check, Strings: Strings}, function(r) {
        console.info('run designMagic.jsx....', r)
      });
    });
    

   /**
     * update
     * マウント時、イベントハンドラ実行時などでupdateされたときはチェックを実行しない
     * チェックの実行は手動のupdateで引数に{mode:check}を含む場合に限る
     */
    this.on('update', function(opt) {
      
      //実行を手動updateに限定する
      if ( getConfig() && (opt && opt.mode === 'check') ) {
       console.log('<validation> on update...checkExecute');
        
        //レイヤーパネルの選択状態を解除
        if ( this.selectedItem ) {
          JSXRunner.runJSX("deselectLayer", null, function (result) {
            console.log('End deselectLayer', result)
          });
        }
        
       this.selectedItem = null;
       this.selectedIds.length = 0;
        
       this.checkExecute(getConfig());
      }
    
    });
    
    /**
     * <nameForm>で名前が変更された後の処理 
     * result.ids == selectedIds
     * result.name 変更後の名前
     * 
     * 結果を元にeachで表示するdataを直接修正する
     */
    this.on('afterNameChange', function(result) {
      var i = 0, l = me.layersMes.length;
      
      while ( i < l ) {
        var item = me.layersMes[i];
        item.changeName = false;
        item.showForm = false;

        if ( me.selectedIds.indexOf(item.id) !== -1) {

          item.title = result.name;

          for(var m = item.hint.length; m--; ) {
            //命名のヒントを消す
            if ( item.hint[m].code == 'NONAME' ) {
              item.hint.splice(m, 1);
            } 
          }

          //ヒントが無くなったら削除
          if ( !item.hint.length ) {
            me.layersMes.splice(i, 1);
            l = l-1;
            i = i-1;
            //チェック結果のerrorVal, warnValも減らす
            me.countDownError(item);
          }

        }

        i = i+1|0;
      }
      
      me.selectedIds = [];
      me.selectedItem = null;
      me.processing = false;

      me.update();
      
      //validation.jsが持ってるチェック結果上書き
      me.result.time = result.startTime - Date.now();
      me.result.message = Strings.formatStr(Strings.Pr_COMPLETE_NAMECHANGE, result.total);
      
      //<app>におしらせ
      me.parent.trigger('toolEnd', this.result);

    });
    
    
    /**
     * appが持ってるconf.jsonを得る
     */
    function getConfig() {
      return me.parent.confCache;
    }
    
    //リセット
    function reset() {
      me.selectedItem = null;
      me.selectedIds.length = 0;
      me.resetResult();
      me.setValidationInfo();
      me.update();
    }
    
    
    /**
     * 親のリセットイベント監視
     */
    this.parent.on('reset', reset);

    //ドキュメント閉じた時
    //内容のリセットする
    window.csInterface.addEventListener( 'documentAfterDeactivate' , reset);
     
    
    /**
     * Photoshopイベントコールバック
     * 引数で渡されるイベントデータに含まれるイベントタイプIDで処理を仕分けている
     *
     * delete(1147958304) - レイヤー削除時　エラーメッセージがあれば消す
     *
     * 参考：
     * http://www.davidebarranca.com/2015/09/html-panel-tips-18-photoshop-json-callback/
     */
    window.csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + extensionId, function PhotoshopCallbackUnique(csEvent) {
      try {
          if (typeof csEvent.data === "string") {
            csEvent.data = JSON.parse(csEvent.data.replace("ver1,{", "{"));
            
            switch(csEvent.data.eventID) {
              case 1147958304: //delete
                  handleDeleteEvent(csEvent.data.eventData.layerID);
                break;

              case 1298866208: //make
                  handleMakeEvent(csEvent.data.eventData.layerID);
                break;
            }

          } else {
              console.log("PhotoshopCallbackUnique expecting string for csEvent.data!");
          }
      } catch(e) {
          console.log("PhotoshopCallbackUnique catch: " + e);
      }
    });

    /**
     * IDで指定したPhotoshop処理にイベントをディスパッチする
     * イベントIDは Photoshop Javascript Scription Reference の 'Appendix A: Event ID Codes' で確認できる
     * http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2015.pdf
     *
     * @param {string} eventStringID 'stringIDToTypeID' に対応したイベントID
     * @return {void}
     */
    function eventRegistering (eventStringID) {

      var event  = new CSEvent("com.adobe.PhotoshopRegisterEvent",
                               "APPLICATION");
      event.extensionId = extensionId;

      csInterface.evalScript("app.stringIDToTypeID('" + eventStringID + "')", function (typeID) {
          event.data = typeID;
          csInterface.dispatchEvent(event);
          console.log("Dispatched Event " + eventStringID + '(' + typeID + ')');
      });
    }
    
    
    /**
     * Photoshop レイヤー削除イベント時の処理
     * エラーメッセージから該当するレイヤーIDのメッセージを消す
     * レイヤーセットを削除したときはIDが渡されない(undefined)ため何も出来ない。。。
     * @param {?Array.<number>} layerID 削除されたレイヤーID
     * @return {void}
     */
    function handleDeleteEvent (layerID) {

      if ( !layerID.length ) {
        return;
      }
      
      layerID = layerID[0];

      var i = 0, l = me.layersMes.length;
      
      while ( i < l ) {
        var item = me.layersMes[i];

        if ( item.id === layerID ) {

            me.layersMes.splice(i, 1);
            l = l-1;
            i = i-1;
            //チェック結果のerrorVal, warnValも減らす
            me.countDownError(item);

        }

        i = i+1|0;
      }
      
      me.update();
      app.trigger('toolEnd', me.result);
      
    };
    
    
    /**
     * Photoshop レイヤー作成イベント時の処理
     * バリデーションリストに命名してくださいメッセージを追加する
     * レイヤーセットを作成したときはIDが渡されない(undefined)ため何も出来ない。。。
     * @param {?Array.<number>} layerID 削除されたレイヤーID
     * @return {void}
     */
    function handleMakeEvent(layerID) {

      if ( !layerID) {
        return;
      }

      var data = {
        id: layerID
      };

      JSXRunner.runJSX("getLayerData", {data: data}, function (result) {
        //result = {"id": 237, "title": "レイヤー 6", "index": 32, "kind": "LayerKind.NORMAL"}
        console.log('handleMakeEvent:' + result);

        var obj = me.stringToObject(result);
        var complete;

        if ( !obj.index ) {
          return;
        }

        obj.hint = [{code: 'NONAME', text: me.getValidationMessage('NONAME_LAYERS', 'hint')}];
        obj.type = 'warn';


        if ( !me.layersMes.length ) {
          me.layersMes.push(obj);
          me.countUpError(obj);
          me.update();
          app.trigger('toolEnd', me.result);
          return;
        }

        var i = 0, l = me.layersMes.length;

        while ( i < l && !complete ) {
          var item = me.layersMes[i];

          if ( item.index < obj.index ) {
              me.layersMes.splice(i, 0, obj);
              l = l+1;
              i = i+1;
              //チェック結果のerrorVal, warnVal再計算
              me.countUpError(item);
              complete = true;

          }

          i = i+1|0;
        }

        me.update();
        app.trigger('toolEnd', me.result);


      });
    };

    eventRegistering('delete'); //1147958304
    eventRegistering('make'); //1147958304
    
    this.mixin('Validation');
    
  </script>

</validation>

<!--レイヤー名変更テキストエリア-->
<nameForm>
 
  <input type="text" id="nameForm" class="topcoat-text-input--large" placeholder="{ title }" value="" onkeydown="{ onKeyDownForm }" onblur="{ onBlurForm }">
  
  <script>
    
    var my = this;
    var app = my.parent.parent;
    
  /**
   * レイヤー名変更処理
   * 押されたキーがEnterだった場合のみchangeLayerName.jsxに新しいレイヤー名を渡して実行する
   * @since version 0.4.0
   * @return {void}
   */
    onKeyDownForm(e) {
      
      var value = e.target.value;
      
      if ( !e.keyCode == 13 || !value.length) { //enter
        return;
      }
      
      //開始時間
      var startTime = Date.now();
      
      //<validation>のステータス変更
      my.parent.processing = true;
      
      //<app>におしらせ
      app.trigger('toolStart', {
        message: Strings.Pr_START_NAMECHANGE
      });
      
      var data = {
        id: my.parent.selectedItem.id,
        ids: my.parent.selectedIds,
        newName: value
      };
    
      //jsx実行
      JSXRunner.runJSX("changeLayerName", {data: data, Strings: Strings}, function (result) {
        
        result = JSON.parse(result);
        result.startTime = startTime;
        
        //<validation>におしらせ
        my.parent.trigger('afterNameChange', result);
        
        my = null;
      });
    };
    
    
    /** 
     * テキストフォームの選択が外れた時のイベントハンドラ
     * フォーム要素を非表示にする（フラグの操作）
     */
    onBlurForm() {
      my.nameForm.value = '';
      my.parent.showForm = false;
    };

    
    this.on('updated', function() {
      if ( my.showForm ) {
        my.nameForm.focus();
      }
    });

  </script>
</nameForm>
