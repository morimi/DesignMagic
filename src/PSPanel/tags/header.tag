<header class="panel-hd panel-header">
    <img src="images/icon/{this.parent.theme}/error.png" width="14" height="14" class="icon">
    <span id="error-total" class="hd-number">{ errorVal }</span>
    <img src="images/icon/{this.parent.theme}/warn.png" width="14" height="14" class="icon">
    <span id="warn-total" class="hd-number">{ warnVal }</span>
    <img src="images/icon/{this.parent.theme}/eye.png" width="14" height="14" class="icon">
    <span id="hidden-total" class="hd-number">{ hiddenVal }</span>
    <div id="status"></div>
    <img src="images/icon/{this.parent.theme}/loader.gif" alt="" id="icon-loader" show="{ this.parent.loading }">
    <div data-mode="check" class="topcoat-button hd-btn" onclick="{DM.switchContainer}">Check</div>
    <div data-mode="config" class="topcoat-button hd-btn" onclick="{DM.switchContainer}">Config</div>
    <div data-mode="tools" class="topcoat-button hd-btn" onclick="{DM.switchContainer}">Tools</div>


  <script>

    //this.root = <header>
    //this.parent = <app>
    var me = this;

    console.info('------mount header------')


    /**
     * @type {number}
     */
    this.errorVal = opts.errorVal || 0

    /**
     * @type {number}
     */
    this.warnVal = opts.warnVal || 0

    /**
     * @type {number}
     */
    this.hiddenVal = opts.hiddenVal || 0
    
  </script>

</header>
