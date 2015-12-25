<!-- @fileoverview バリデーション結果メッセージ部分 -->
<validation-message>
 
  <div class="message-wrapper {selected:selected}">
    <p class="message-title">
      <img riot-src="images/icon/{ opts.theme }/{ type }.png" width="14" height="14" class="icon { type } alert">
      <img if="{ kind }" riot-src="images/icon/{ opts.theme }/{ kind }.png" width="14" height="14" class="icon kind">
      <span class="title {change:changeName}" if="{ !showForm }">{ title }</span>
      <nameForm value="{title}" if="{ showForm }" showForm="{ showForm }"></nameForm>
    </p>
    <p class="message-hint" each="{ hint }">
      { text }
    </p>
  </div>
  
  <div class="message-data" data-type="{ type }" data-id="{ id }" data-index="{ index }" data-hints="{ hintCodes }" onclick="{ toggle }" hide="{ showForm }"></div>


<script>
  
  var me = this;
  
  /**
   * 初回クリックタイムスタンプ
   * @type {number}
   */
  var start;
  
  /**
   * クリックカウンター
   * @type {number}
   */
  var i = 0;
  
  /**
   * メッセージの選択状態
   * １回目クリックでtrue
   * @type {boolean}
   */
  this.selected = opts.selected || false;
  
  /**
   * 名前変更状態
   * 400ms以内に２回目クリックでtrue
   * @type {boolean}
   */
  this.changeName = opts.changeName || false;
  
  /**
   * レイヤー名編集用テキストエリア表示状態
   * trueで表示
   * @type {boolean}
   */
  this.showForm = false;
  
  
  /**
   * 同じレイヤー名がほかに存在する時まとめて変更するかどうか
   * true: 変更する
   * @type {boolean}
   */
  this.isAllChangeLayerName = window.localStorage.getItem('com.cyberagent.designmagic:nameChangeAll') === 'true';
  
    
  /**
   * バリデーションメッセージがクリックされた時の処理
   * @param {MouseEvent} e 
   * @return {void}
   */
  toggle(e) {
    
    //@type {HTML Element} div.message-data
    //var el = e.target;
    //li.message el.parentElement
    //span.title el.parentElement.childNodes[1].childNodes[1].childNodes[5]
    
    if ( i == 0 )  {
      
      this.selected = true;
      
      start = Date.now();
    
      //<validation>を経由してほかのメッセージにIDを通知
      this.parent.trigger('select', this.id);
    
      i = 1;
      
      //時間切れ
      setTimeout(function(){
        i = 0;
      }, 400);
      
    } else {
      
      i = 0;
      
      //ダブルクリック判定
      if ( (Date.now() - start) < 400 ) {
        //<validation>を経由してほかのメッセージにレイヤー名を通知
        this.parent.trigger('changeName', this.title);
      }
      
      start = Date.now();
    } 
  }
  
  //<validation>経由で選択されたIDが渡されたら
  this.parent.on('select', function(id) {
    
    //自身のIDと比較して選択状態を変更
    me.selected = (id === me.id);
    me.showForm = false;
    me.changeName = false;
    i = 0;
      
  });
  
  //ダブルクリックして<validation>経由でレイヤー名が渡されたら
  this.parent.on('changeName', function(name) {
    
    //自身のnameと比較して状態を変更
    me.changeName = (name === me.title);
    
    //レイヤー名が同じである場合はIDを<validation>に通知
    if (name === me.title) {
      me.parent.trigger('pushIds', me.id);
    }
    
    //レイヤー名が同じで選択状態の場合はテキストエリアを表示
    if ( ( name === me.title ) && me.selected ){ 
      me.showForm = true;
    
    }
    
  });
  
  
  /**
   * 削除された
   */
  this.on('unmount', function() {
    me.update();
  });
    

  /**
   * 名前が変更された
   */
  this.parent.on('afterNameChange', function(result) {

    if ( result.ids.indexOf(me.opts.id) === -1 ) {
      return;
    }
    
    console.log('message.change.complete', result)

    for(var i = me.hint.length; i--; ) {
      var hint = me.hint[i];

      if ( hint.code == 'NONAME' ) {
        me.hint.splice(i, i+1);
      } 

    }

    if ( !me.hint.length ) {
      me.unmount();
    } else {
      
      me.showForm = false;
      me.changeName = false;
      me.update({title:result.name});
    }

  });
  
  this.mixin('RunJSX');
  
</script>

</validation-message>


<nameForm>
  <input type="text" id="nameForm" placeholder="{ title }" value="" onkeydown="{ change }" onblur="{ blur }">
  
  <script>
    var my = this;
  
    this.on('updated', function() {
      if ( my.parent.showForm ) {
        my.nameForm.focus();
      }
    });
    
    
  /**
   * 変更処理
   * changeLayerName.jsxに新しいレイヤー名を渡して実行する
   * @since version 0.4.0
   * @return {void}
   */
    change(e) {
      var value = e.target.value;
      
      if ( !e.keyCode == 13 || !value.length) { //enter
        return;
      }
      
      var data = {
        id: my.Storage.getStorage('selectedId'),
        ids: my.Storage.getStorage('selectedIds'),
        newName: value
      };
      
      this.RunJSX.changeLayerName(data, this.afterChange);
    }
    
    /** 
     *
     */
    blur() {
      my.nameForm.value = '';
       my.parent.showForm = false;
    }
    
    
    
    this.afterChange = function(result) {
      
      console.log('change.complete', my.parent.id)
      
      result.ids = my.Storage.getStorage('selectedIds');
      
      my.parent.parent.trigger('afterNameChange', result);
      
//      var hints = my.parent.hint;
//      
//      for(var i = hints.length; i--; ) {
//        var hint = hints[i];
//        
//        if ( hint.code == 'NONAME' ) {
//          hints.slice(i, 1);
//        } 
//      }
//      
      
      
    }
    
    this.mixin('RunJSX');
    this.mixin('Storage');
  </script>
</nameForm>