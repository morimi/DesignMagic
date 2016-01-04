<!-- @fileoverview バリデーション結果メッセージ部分 -->
<validation-message>
 
<ul id="message-layers" class="list">

 <li class="message" each="{ opts.data.filter(listFilter) }" onclick="{ toggle }">
  <div class="message-wrapper {selected:selected}">
    <p class="message-title">
      <img riot-src="images/icon/{ theme }/{ type }.png" width="14" height="14" class="icon { type } alert">
      <img if="{ kind }" riot-src="images/icon/{ theme }/{ kind }.png" width="14" height="14" class="icon kind">
      <span class="title {change:changeName}" if="{ !showForm }">{ title }</span>
      <nameForm value="{title}" if="{ showForm }" showForm="{ showForm }"></nameForm>
    </p>
    <p class="message-hint" each="{ hint }">
      { text }
    </p>
  </div>
 </li>

</ul>
<script>
  
  var me = this;
  
  /**
   * 処理中の場合 true 
   */
  this.processing = false;
  
  /**
   * ダブルクリックで選択されたメッセージ
   */
  this.selectedItem = null;
  
  /**
   * selectedItemと同じレイヤー名のメッセージID配列
   * @type {Array.<number>}
   */
  this.selectedIds = [];
  
  /**
   * 同じレイヤー名がほかに存在する時まとめて変更するかどうか
   * true: 変更する
   * @type {boolean}
   */
  this.isAllChangeLayerName = window.localStorage.getItem('com.cyberagent.designmagic:nameChangeAll') === 'true';
  
  /**
   * バリデーションメッセージがクリックされた時の処理
   * @param {MouseEvent} e イベントオブジェクト
   * @return {void}
   */
  toggle(e) {
      
    /**
     * クリックされたメッセージデータ
     * @type {Object}
     */
    var item = e.item;
    
    if ( this.processing ) {
      return;
    }

    if ( item.clickCount != 1 )  {
      this.selectedIds = [];
      /**
       * メッセージの選択状態
       * １回目クリックでtrue
       * @type {boolean}
       */   
      item.selected = true;
    
      /**
       * 初回クリックタイムスタンプ
       * @type {number}
       */
      item.startTime = Date.now();
      
      /**
       * クリックカウンター
       * @type {number}
       */
      item.clickCount = 1;
  
      /**
       * 名前変更状態
       * 400ms以内に２回目クリックでtrue
       * @type {boolean}
       */
      //item.changeName = false;
      
      /**
       * レイヤー名編集用テキストエリア表示状態
       * trueで表示
       * @type {boolean}
       */
      //item.showForm = false;
      
      //item保存
      this.selectedItem = item;
      
      
      //レイヤーパネルも選択状態にする
      me.RunJSX.selectLayer(item.id);
      

      //時間切れ
      setTimeout(function(){
        item.clickCount = 0;
      }, 400);
      
    } else if (item.clickCount == 1) {
      
      item.clickCount = 0;
      
      //ダブルクリック判定
      if ( (Date.now() - item.startTime) < 400 ) {
        this.handleDoubleClick(item);
      }
      
      item.startTime = Date.now();
    } 
  }
  
  /**
   * 選択状態のフィルタリング
   * @param {Object} item メッセージデータ
   */
  listFilter(item) {
    
    if (! this.selectedItem ) {
       return item;
    }
    
    //自身のIDと比較して選択状態を変更
    if ( this.selectedItem.id != item.id ) {
      item.selected = false;
      item.changeName = false;
      item.showForm = false;
    }
    
    //同じレイヤー名を持つメッセージのIDが発見されたら
    if (this.selectedItem.title == item.title ) {
      item.changeName = true;
      
      if ( this.selectedIds.indexOf(item.id) === -1) {
        //IDを保存しておく
        this.selectedIds.push(item.id);
      }
    }
    
    
    return item;
  }

  /**
   * メッセージがダブルクリックされたときのイベントハンドラ
   * @param {Object} item ダブルクリックされたメッセージデータ
   */
   this.handleDoubleClick =  function(item) {
     item.changeName = true;
     
    var i, l = me.selectedIds.length;
     
      //レイヤーパネルの選択を増やす
      me.RunJSX.selectLayerAll(me.selectedIds);
     
     item.showForm = true;
  };

    
  /**
   * 名前が変更された後の処理
   * result.ids == selectedIds
   * result.name 変更後の名前
   * 
   * 結果を元にeachで表示するdataを修正する
   * 
   * filterで処理して生成したdataをupdateに渡して更新したい気持ちになったが
   * 実際やってみると何の反応もなかった。どうやら親の方で渡してやらないとだめらしい
   * @param {Object} result nameFormからtrigger経由で渡されたjsxの返り値
   */
  this.on('afterNameChange', function(result) {
    
    var i = 0, l = me.opts.data.length;
      
    while ( i < l ) {
      var item = me.opts.data[i];
      item.changeName = false;
      item.showForm = false;
      
      if ( result.ids.indexOf(item.id) !== -1) {
        
        item.title = result.name;
      
        for(var m = item.hint.length; m--; ) {
          if ( item.hint[m].code == 'NONAME' ) {
            item.hint.splice(m, 1);
          } 
        }

        if ( !item.hint.length ) {
          me.opts.data.splice(i, 1);
          l = l-1;
          i = i-1;
        }
        
      }
        i = i+1|0;
    }
    
    me.selectedIds = [];
    me.selectedItem = null;
    
    me.update();

  });
  
  this.mixin('RunJSX');
  
</script>

</validation-message>


<nameForm>
  <input type="text" id="nameForm" placeholder="{ title }" value="" onkeydown="{ change }" onblur="{ blur }">
  
  <script>
    var my = this;
    var startTime = 0;
  
    this.on('updated', function() {
      if ( my.showForm ) {
        my.nameForm.focus();
      }
    });
    
    
  /**
   * 変更処理
   * 押されたキーがEnterだった場合のみchangeLayerName.jsxに新しいレイヤー名を渡して実行する
   * @since version 0.4.0
   * @return {void}
   */
    change(e) {
      var value = e.target.value;
      
      if ( !e.keyCode == 13 || !value.length) { //enter
        return;
      }
      
      startTime = Date.now();
      
      my.parent.processing = true;
      
      var data = {
        id: my.parent.selectedItem.id,
        ids: my.parent.selectedIds,
        newName: value
      };
      
      this.RunJSX.changeLayerName(data, this.afterChange);
    }
    
    /** 
     * テキストフォームの選択が外れた時のイベントハンドラ
     * フォーム要素を非表示にする（フラグの操作）
     */
    blur() {
      my.nameForm.value = '';
      my.parent.showForm = false;
    }
    
    
    /**
     * 変更完了後に実行される
     * 処理中フラグをoffにしてafterNameChangeイベントを発火
     * @param {OBject} result Object化した結果
     */
    this.afterChange = function(result) {
      my.parent.processing = false;
      
      my.parent.trigger('afterNameChange', result);
    
      my.setConsole({
        time: my.getExecTime(startTime),
        message: Strings.formatStr(Strings.Pr_COMPLETE_NAMECHANGE, result.total)
      });
      
    };
    
    this.mixin('RunJSX');
    this.mixin('Console');
  </script>
</nameForm>