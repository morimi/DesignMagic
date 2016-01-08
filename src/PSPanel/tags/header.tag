<header class="panel-hd panel-header">
  <img src="images/icon/{ parent.theme }/error.png" width="14" height="14" class="icon">
  <span id="error-total" class="hd-number">{ errorVal }</span>
  <img src="images/icon/{ parent.theme }/warn.png" width="14" height="14" class="icon">
  <span id="warn-total" class="hd-number">{ warnVal }</span>
  <img src="images/icon/{ parent.theme }/eye.png" width="14" height="14" class="icon">
  <span id="hidden-total" class="hd-number">{ hiddenVal }</span>
  <div id="status"></div>
  <img src="images/icon/{ parent.theme }/loader.gif" alt="" id="icon-loader" show="{ loading }">
  <a href="#check" class="topcoat-button hd-btn" onClick="{ check }">Check</a>
  <a href="#config" class="topcoat-button hd-btn">Config</a>
  <a href="#tools" class="topcoat-button hd-btn">Tools</a>
  
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
     */
    check(e) {
      this.parent.mode = 'check';
      this.parent.update({mode: 'check'})
      location.hash = '#check';
    }

    
  </script>
</header>