<footer class="panel-hd panel-footer">
  <div id="console">
    <span class="time lv{ calcGuilty() }" if="{ time }">{ time }</span>
    <span class="console-message" if="{ message }">{ message }</span>
  </div>

  <script>
    var me = this;
    
    this.time = null
    
    this.message = null
          
    /**
     * エラーと注意の総数から罪の重さを量る
     * @return {number} 0 - 7 （罪の重さを8段階で返す）
     */
    calcGuilty() {
      var g = 0;

      if (( this.errorVal > 20 ) || ( this.warnVal > 120 )) g = 7;
      else if (( this.errorVal > 15 ) || ( this.warnVal > 90 )) g = 6;
      else if  (( this.errorVal > 10 ) || ( this.warnVal > 60 )) g = 5;
      else if  (( this.errorVal > 5 ) || ( this.warnVal > 30 )) g = 4;
      else if  (( this.errorVal > 1 ) || ( this.warnVal > 20 )) g = 3;
      else if  ( this.warnVal > 10 ) g = 2;
      else if  ( this.warnVal > 0 )  g = 1;

      return g;
    }
  </script>
</footer>