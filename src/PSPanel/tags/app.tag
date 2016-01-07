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
      me.trigger('loadconf', data);
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
      me.tags.footer.update(opt);
    });
    
    
    /**
     * check始まったときの処理
     */
    this.tags.validation.on('validationStart', function(result) {
      console.log('<app> on validationStart');
      opt.loading = true;
      opt.message = Strings.Pr_MESSAGE_CHECK_START;
      me.tags.header.update(opt);
      me.tags.footer.update(opt);
    });
    
    /**
     * check終わったときの処理
     * headerとfooterに結果渡して更新
     */
    this.tags.validation.on('validationEnd', function(result) {
      console.log('<app> on validationEnd');
      result.loading = false;
      me.tags.header.update(result);
      me.tags.footer.update(result);
    });
    
    
    this.on('toolStart', function(data) {
      console.log('<app> on toolStart');
      data.loading = true;
      me.tags.header.update(data);
      me.tags.footer.update(data);
    });
    
    
    this.on('toolEnd', function(data) {
      console.log('<app> on toolEnd');
      data.loading = false;
      me.tags.header.update(data);
      me.tags.footer.update(data);
    });
      
    this.mixin('Config');
  </script>
</app>
