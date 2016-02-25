/**
 * PsEventCallback
 * Photoshopのレイヤーパネルで発生したイベントをキャッチして処理する
 *
 * # 依存
 * 
 * + isClickMes(property)
 * + selectedItem(property)
 * + selectedIds(property)
 * + Validation(mixin)
 * ++ countDownError(method)
 * ++ layersMes(property)
 *
 * 参考：
 * http://www.davidebarranca.com/2015/09/html-panel-tips-18-photoshop-json-callback/
 */
riot.mixin('PsEventCallback', {
  
  
  init: function() {
    
    this.psEventRegistering('make');
    this.psEventRegistering('delete'); //1147958304
    this.psEventRegistering('select');//1936483188
    this.psEventRegistering('set');//1936028772
    
  },
  
  registerEvent: function(typeID, unRegister) {
    var eventEnding = null;  
    if (unRegister) {  
      console.log('UnRegistering ' + typeID);  
      eventEnding = 'PhotoshopUnRegisterEvent';  
      window.csInterface.removeEventListener('com.adobe.PhotoshopJSONCallback' + window.extensionId, this.photoshopCallbackUnique);  
    } else {  
      console.log('Registering ' + typeID);  
      eventEnding = 'PhotoshopRegisterEvent';  
      window.csInterface.addEventListener("com.adobe.PhotoshopJSONCallback" + window.extensionId, this.photoshopCallbackUnique);  
    }  

    var event = new CSEvent(  
      "com.adobe." + eventEnding,  
      "APPLICATION",  
      applicationId,  
      extensionId  
    );  

    event.data = typeID;  
    csInterface.dispatchEvent(event);  
  },
          
  /**
   * Photoshopイベントコールバック
   * 引数で渡されるイベントデータに含まれるイベントタイプIDで処理を仕分けている
   *
   * delete(1147958304) - レイヤー削除時　エラーメッセージがあれば消す
   * make(1147958304) - レイヤー作成時 メッセージを追加
   * select(1936483188) - レイヤー選択時　メッセージを選択
   * set(1936028772) - レイヤー名変更時など　メッセージを編集
   * @param {Object} csEvent psEventRegisteringで作成したカスタムイベント
   */                              
  photoshopCallbackUnique: function photoshopCallbackUnique(csEvent) {
    try {
        if (typeof csEvent.data === "string") {

          csEvent.data = JSON.parse(csEvent.data.replace("ver1,{", "{"));

          switch(csEvent.data.eventID) {
            case 1147958304: //delete
                this.handlePsDeleteEvent(csEvent.data.eventData.layerID);
              break;

            case 1298866208: //make
                this.handlePsMakeEvent(csEvent.data.eventData.layerID);
              break;
            case 1936483188: //select
              if (! this.isClickMes )
                this.handlePsSlctEvent(csEvent.data.eventData.layerID);
                this.isClickMes = false;
              break;
            case 1936028772: //set
              this.handlePsSetEvent(csEvent.data.eventData.to)
              break;
          }

        } else {
            console.log("PhotoshopCallbackUnique expecting string for csEvent.data!");
        }
    } catch(e) {
        console.log("PhotoshopCallbackUnique catch: " + e);
    }
  },

  /**
   * IDで指定したPhotoshop処理にイベントをディスパッチする
   * イベントIDは Photoshop Javascript Scription Reference の 'Appendix A: Event ID Codes' で確認できる
   * http://wwwimages.adobe.com/content/dam/Adobe/en/devnet/photoshop/pdfs/photoshop-cc-javascript-ref-2015.pdf
   *
   * @param {string} eventStringID 'stringIDToTypeID' に対応したイベントID
   * @return {void}
   */
  psEventRegistering: function psEventRegistering(eventStringID) {

    var event  = new CSEvent("com.adobe.PhotoshopRegisterEvent",
                             "APPLICATION");
    event.extensionId = this.extensionId;

    csInterface.evalScript("app.stringIDToTypeID('" + eventStringID + "')", function (typeID) {
        
      this.registerEvent(typeID, true);  // unRegister (just in case)  
      this.registerEvent(typeID, false); // Register  
      
      //console.log("Dispatched Event " + eventStringID + '(' + typeID + ')');
    }.bind(this));
  },
  
  /**
   * Photoshop レイヤー削除イベント時の処理
   * エラーメッセージから該当するレイヤーIDのメッセージを消す
   * レイヤーセットを削除したときはIDが渡されない(undefined)ため何も出来ない。。。
   * レイヤーを削除した時、レイヤーパネルでは下のレイヤーにターゲットが移るので
   * IDを得てからメッセージ削除ついでにselectedItemを変更する
   * @param {?Array.<number>} layerID 削除されたレイヤーID
   * @return {void}
   */
  handlePsDeleteEvent: function handlePsDeleteEvent(layerID) {

    if ( !layerID.length ) {
      return;
    }
    
    var me = this;
    var i = 0, l = this.layersMes.length;
    
    //アクティブレイヤーのIDを得る
    csInterface.evalScript('DM.getActiveLayerId()', function(activeId) {
      layerID = layerID[0];
      activeId = parseInt(activeId);

      while ( i < l ) {
        var item = me.layersMes[i];

        if ( item.id === activeId ) {
          me.selectedItem = item;
          item.selected = true;
        }

        if ( item.id === layerID ) {
          me.layersMes.splice(i, 1);
          l = l-1;
          i = i-1;
          //チェック結果のerrorVal, warnValも減らす
          me.countDownError(item);
          me.selectedItem = null;
        }

        i = i+1|0;
      }

      me.update();
      me.parent.trigger('toolEnd', me.result);
      
    });

  },
    
  /**
   * Photoshop レイヤー作成イベント時の処理
   * バリデーションリストに命名してくださいメッセージを追加する
   * レイヤーセットを作成したときはIDが渡されない(undefined)ため何も出来ない。。。
   * @param {?Array.<number>} layerID 削除されたレイヤーID
   * @return {void}
   */
  handlePsMakeEvent: function handlePsMakeEvent(layerID) {
    var me = this;
    var app = this.parent;

    if ( !layerID) {
      return;
    }
  

    var data = {
      id: layerID
    };

    //作成されたレイヤーの情報を得る
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
      obj.selected = true;

    
      me.selectedItem = obj;

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
          //上に追加
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
  },
  
  
  /**
   * Photoshop レイヤー選択イベント時の処理
   * レイヤーパネルで選択されたかどうかの区別をする為に、
   * messageのonclickイベント時にisClickMesをtrueにしている
   * @param {?Array.<number>} layerID 選択されたレイヤーID
   */
  handlePsSlctEvent: function handlePsSlctEvent(layerID) {

    if ( !this.layersMes.length) {
      return;
    }

    var el = document.getElementsByClassName('id-' + layerID);

    if ( el.item() ) {
      el.item().scrollIntoView(true);
    }

    var i = 0, l = this.layersMes.length;

    while ( i < l ) {
      var item = this.layersMes[i];
      if ( layerID.indexOf(item.id) !== -1 ) {
        item.selected = true;
        this.selectedItem = item;
      }

      i = i+1|0;
    }

    this.update();
  },
  
  
  /**
   * Photoshop setイベント時の処理
   * <to.name> 命名変更
   *  レイヤー名チェックがtrueになっており、
   *  命名規則チェックにパスして命名エラー以外のヒントが存在しない場合は
   *  該当するエラーメッセージを削除する
   * @param {Object} to  charIDToTypeID( "T   " ) の値
   */
  handlePsSetEvent: function handlePsSetEvent(to) {
    var config = this.getConfig().check;
        
    /**
     * 命名チェックレベル毎の正規表現
     * 0 : レイヤー、グループ のコピー のみ
     * 1 : Lv0 + シェイプ
     * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
     */
    var NAME_REGEX = {
      0 : new RegExp('/' + Strings.Pr_LAYER_NAME_REGEX_0 + '/i'),
      1 : new RegExp('/' + Strings.Pr_LAYER_NAME_REGEX_1 + '/i'),
      2 : new RegExp('/' + Strings.Pr_LAYER_NAME_REGEX_2 + '/i')
    };


    if ( to.name && this.selectedItem && config.layers.name) {
      console.log('handleSetEvent:name');

      this.selectedItem.title = to.name;

      //命名チェック
      if ( ! NAME_REGEX[config.layers.namingLevel].test(to.name) ) {
        
        for(var m = this.selectedItem.hint.length; m--; ) {
          //命名のヒントを消す
          if ( this.selectedItem.hint[m].code == 'NONAME' ) {
            this.selectedItem.hint.splice(m, 1);
          } 
        }

        //ヒントが無くなったら削除
        if ( !this.selectedItem.hint.length ) {
          var index = this.layersMes.indexOf(this.selectedItem);
          this.layersMes.splice(index, 1);

          //チェック結果のerrorVal, warnValも減らす
          this.countDownError(this.selectedItem);
          this.selectedItem = null;
          this.selectedIds.length = 0;
        }
      }
      
      this.update();
      this.parent.trigger('toolEnd', this.result);
      
    }//name

  }

    
    
  
});