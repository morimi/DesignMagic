<header class="panel-hd panel-header">
  <img src="images/icon/{ parent.theme }/error.png" width="14" height="14" class="icon">
  <span id="error-total" class="hd-number">{ errorVal }</span>
  <img src="images/icon/{ parent.theme }/warn.png" width="14" height="14" class="icon">
  <span id="warn-total" class="hd-number">{ warnVal }</span>
  <img src="images/icon/{ parent.theme }/eye.png" width="14" height="14" class="icon">
  <span id="hidden-total" class="hd-number">{ hiddenVal }</span>
  <div id="status"></div>
  <img src="images/icon/{ parent.theme }/loader.gif" alt="" id="icon-loader" show="{ loading }">
  <div data-mode="check" class="topcoat-button hd-btn" onclick="{ switchContainer }">Check</div>
  <div data-mode="config" class="topcoat-button hd-btn" onclick="{ switchContainer }">Config</div>
  <div data-mode="tools" class="topcoat-button hd-btn" onclick="{ switchContainer }">Tools</div>
  
    <script>

    //this.root = <header>
    //this.parent = <app>
    var me = this;

    console.info('------mount header------')


    /**
     * @type {number}
     */
    this.errorVal = opts.errorVal || 0;

    /**
     * @type {number}
     */
    this.warnVal = opts.warnVal || 0;

    /**
     * @type {number}
     */
    this.hiddenVal = opts.hiddenVal || 0;
    
    
    /**
     * loader.gifの表示トリガー
     * @type {boolean}
     */
    this.loading = opts.loading || true;
    
    

    /**
     * 表示モード(mode)を要素のdata-modeで指定された値に変更する
     * 'check' - バリデーション表示(初期値)
     * 'config' - conf.json内容表示
     * 'setting' - URL設定変更表示
     * 'tools' - ツール表示
     */
    switchContainer(e) {
      this.parent.mode = e.currentTarget.getAttribute('data-mode');
      this.parent.update({mode: this.parent.mode})
    }
    
  </script>
</header>