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
    var _opt = {};
    
    /**
     * 表示モード
     * 'check' - バリデーション表示(初期値)
     * 'configs' - conf.json内容表示
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
     * 表示モード(mode)を要素のdata-modeで指定された値に変更する
     * 'check' - バリデーション表示(初期値)
     * 'config' - conf.json内容表示
     * 'setting' - URL設定変更表示
     * 'tools' - ツール表示
     */
    riot.route(function(mode){
      console.log('riot.route === ' + mode)
      me.mode = mode;
      me.update();
    });
    
    
    this.on('reset', function() {
      me.resetConfig();
    });
    
    /**
     * 保存したとき自動チェック
     * csInterfaceに渡すイベント
     */
    this.handleAutoCheck = function () {
      riot.route('check');
      me.tags.validation.update({mode: 'check'});
    }
    
    if ( window.localStorage.getItem('com.cyberagent.designmagic:autocheck') === 'true') {
      window.csInterface.addEventListener( 'documentAfterSave' , this.handleAutoCheck);
    }
    
    /**
     * start app
     */
    this.on('mount', function () {
      console.info('<app> Start loading of conf.json...');
      
      Q.fcall(me.loadConfig)
       .done(function(data) {
          console.log('╭( ･ㅂ･)و ̑̑ ｸﾞｯ', me.confCache);
          _opt.loading = false;
          me.tags.header.update(_opt);
          me.tags.configs.update();
          me.trigger('loadconf', data);
       });
    });
    
    
    /**
     * console message
     */
    this.on('message', function(mes) {
      _opt.message = mes;
      me.tags.footer.update(_opt);
    });
    
    
    /**
     * check始まったときの処理
     */
    this.tags.validation.on('validationStart', function(result) {
      console.log('<app> on validationStart');
      _opt.loading = true;
      _opt.message = Strings.Pr_MESSAGE_CHECK_START;
      me.tags.header.update(_opt);
      me.tags.footer.update(_opt);
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
    
    /**
     * ツール処理始まる時の処理
     */
    this.on('toolStart', function(data) {
      console.log('<app> on toolStart');
      data.loading = true;
      me.tags.header.update(data);
      me.tags.footer.update(data);
    });
    
    
    /**
     * ツール処理終わった時の処理
     */
    this.on('toolEnd', function(data) {
      console.log('<app> on toolEnd');
      data.loading = false;
      me.tags.header.update(data);
      me.tags.footer.update(data);
    });
    
    
    this.mixin('Config');
  </script>
</app>
