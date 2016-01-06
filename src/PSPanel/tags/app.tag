<app>

  <div id="content">

    <header></header>


    <validation></validation>
    <configs></configs>
    <tools></tools>

    <footer></footer>

  </div>

  <script>
    
    console.info('------mount app------');

    // this.root = <app></app>
    // this.parent = undefined

    var me = this;
    var opt = {};
    
    
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

    
    
    /**
     * @private
     */
    function onConfigLoaded(data) {
      console.log('╭( ･ㅂ･)و ̑̑ ｸﾞｯ');
      opt.loading = false;
      me.tags.header.update(opt);
      me.trigger('loadconf');
    };
    
    /**
     * start app
     */
    this.on('mount', function () {
      console.info('<app> Start loading of conf.json...');
      
      
      Q.fcall(me.loadConfig)
       .done(onConfigLoaded);
      
    });
    
    /**
     * console message
     */
    this.on('message', function(mes) {
      opt.message = mes;
      me.tags.footer.update(opt)
    });
    
    
    /**
     * check終わったときの処理
     * headerとfooterに結果渡して更新
     */
    this.tags.validation.on('validationEnd', function(result) {
      console.log('validationEnd');
      me.tags.header.update(result);
      me.tags.footer.update(result);
    });
      
    this.mixin('Config');
  </script>
</app>
