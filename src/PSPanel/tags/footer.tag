<footer class="panel-hd panel-footer">
  <div id="console">
    <span class="time lv{lv}" if="{ time }">{time}</span>
    <span class="console-message" if="{ message }">{message}</span>
  </div>

  <script>
    var me = this;
    
    this.time = null
    
    this.message = null
    
    this.lv = null
    
  </script>
</footer>
