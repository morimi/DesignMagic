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
     * 基本設定項目 conf.json
     * @type {Object}
     */
    this.conf = require("../conf.json");

    /**
     * ローカルで読み込んだファイルの一時格納場所
     * @type {?string}
     */
    this.localConfFile = null;

     /**
     * conf.jsonのキャッシュ
     * @type {?Object}
     */
    this.confCache = null;

    /**
     * #consoleに出力する内容
     */
    this.consoleText  = null;


    /**
     * loader.gifの表示トリガー
     * @type {boolean}
     */
    this.loading = true;

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
    this.theme = 'dark';


    DM.app = this;


    /**
     * start app
     */
    this.on('mount', function() {
      DM.init();
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

      console.log('[vm.changeMode]' + me.mode);

      if ( typeof str !== 'string') {
        str = 'check';
      }

      me.mode = str;

      me.tags.validation.update()
      me.tags.configs.update()
      me.tags.tools.update();
    })

  </script>
</app>
