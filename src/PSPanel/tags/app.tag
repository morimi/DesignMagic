<app>

  <!-- @fileoverview Design Magic (RiotJS ver) app.tag -->

  <div id="content">

    <header></header>

    <validation></validation>
    <configs></configs>
    <tools></tools>

    <footer></footer>

  </div>

  <script>

    // this.root = <app></app>
    // this.parent = undefined

    var me = this;


    /**
     * 表示モード
     * 'check' - バリデーション表示(初期値)
     * 'config' - conf.json内容表示
     * 'setting' - URL設定変更表示
     * 'tools' - ツール表示
     * @type {string}
     */
    this.mode = 'check';


    /**
     * UIのテーマ
     * 初期値は'dark'
     * 'darker' 'dark' 'light' 'lighter'
     * @type {string}
     */
    this.theme = themeManager.getThemeColorType() || 'dark';


    themeManager.init();

    /**
     * start app
     */
    this.on('mount', function() {
          
      Q.fcall(me.loadConfig)
       .done(function(data) {
        me.hideLoading();
        me.trigger('confCache', data);
        console.log('╭( ･ㅂ･)و ̑̑ ｸﾞｯ');
      })

    })

    /**
     * 表示モード(mode)を引数で渡された値に変更する
     * 'check' - バリデーション表示(初期値)
     * 'config' - conf.json内容表示
     * 'setting' - URL設定変更表示
     * 'tools' - ツール表示
     * @param {?string} str　変更する値。stringでなかった場合は'check'になる
     */
    this.on('mode', function(str){

      if ( typeof str !== 'string') {
        str = 'check';
      }

      me.mode = str;

      me.update(str);
//      me.tags.validation.update()
//      me.tags.configs.update()
//      me.tags.tools.update();
    });
    
    this.mixin('Config');
    this.mixin('Loading');

  </script>
</app>
