<validation>

  <div id="validation" class="container"
    show="{this.parent.mode == 'check'}">
    <ul id="message-layers" class="list">
     
      <li class="message" each="{ layersMes }" data-type="{type}" data-id="{id}" data-index="{index}" data-hints="{hintCodes}">
        <div class="message-wrapper">
          <p class="message-title">
            <img riot-src="images/icon/{theme}/{type}.png" width="14" height="14" class="icon {type} alert">
            <img if="{ kind }" riot-src="images/icon/{theme}/{kind}.png" width="14" height="14" class="icon kind">
            <span class="title">{title}</span>
          </p>
          <p class="message-hint" each="{ hi, i in hint }">{ hi }</p>
        </div>
      </li>
      
    </ul>
    <ul id="message-others" class="list">
       <li class="validation-info" id="validation_info" if="{ !othersMes.length }"></li>
       
       <li class="message" each="{ othersMes }" data-type="{type}" data-id="{id}" data-index="{index}" data-hints="{hintCodes}">
        <div class="message-wrapper">
          <p class="message-title">
            <img riot-src="images/icon/{theme}/{type}.png" width="14" height="14" class="icon {type} alert">
            <span class="title">{title}</span>
          </p>
          <p class="message-hint" each="{ hi, i in hint }">{ hi }</p>
        </div>
      </li>
    </ul>
  </div>

  <script>

    console.info('------mount validation------')
    //this.root = <validation>
    //this.parent = <app>
    var me = this;
    var errorVal = 0;
    var warnVal = 0;
    
    
    this.layersMes = [];
    this.othersMes = [];

      
    this.parent.on('confCache', function(data) {

      me.validation_info.innerHTML = (data && data.name) ? Strings.Pr_READY_TO_VALIDATION : Strings.Pr_SETTING_TO_URL

    });
    
    
    this.on('update', function(mode, validation) {
      if (mode != 'check' && !validation) return;
        
      errorVal = 0;
      warnVal = 0;
        
      me.layersMes = [];
      me.othersMes = [];
      
      Q.fcall(DM.loadConfig)
       .then(checkUnits)
       .done(function() {
        console.log('check completed ٩(ˊᗜˋ*)و')
        me.update();
        me.parent.tags.header.update({ errorVal: errorVal, warnVal: warnVal});
      })
      
    })
   
    
 function countError (obj) {
     
     if ( obj.type == 'error' ) errorVal = errorVal + 1|0;
     if ( obj.type == 'warn' )  warnVal = warnVal + 1|0;
     //h = h+1|0;
 }
 
      
  /**
   * 単位チェック
   */
  function checkUnits(c) {
    var d = Q.defer();

    if (c.check.config.rulerUnits || c.check.config.typeUnits) {

      JSXRunner.runJSX("checkUnits", {config: c.check.config}, function (result) {

        var obj = DM.stringToObject(result);

        if (_.isObject(obj) && obj.list.length) {

          _.each(obj.list, function(r, i) {
            var name = _.camelCase(r.name);
            var label =  DM.UNITS_LABEL[c.check.config[name + 'Type']],
                unit = DM.UNITS_LABEL[r.value.replace(/(Units|TypeUnits)\./, '')];

            if ( r.type === 'error') {
              r.hint = [ Strings.formatStr(DM.getValidationMessage(r.name, 'hint'), label) ];
            }
              
             r = _.extend({
                theme: themeManager.getThemeColorType(),
                title: Strings.formatStr(DM.getValidationMessage(r.name, r.type), unit)
             }, r );
              
              countError(r);
              me.othersMes.push(r)

          });

        }

        d.resolve(c);
      });

    } else {

      d.resolve(c);

    }

    return d.promise;

  };
      
      
  /**
   * ドキュメントモードのチェック
   */
  function checkDocumentMode(c) {
    var d = Q.defer();

    if (c.check.config.documentMode) {

      JSXRunner.runJSX("checkDocumentMode", {config: c.check.config}, function (result) {

        var obj = DM.stringToObject(result);
        if (_.isObject(obj) && obj.type) {

          if ( obj.type === 'error' ) {
            obj.hint = [Strings.formatStr(DM.getValidationMessage('DOCUMENTMODE', 'hint'), label)];
          }
            
          r = _.extend({
            theme: themeManager.getThemeColorType(),
            title: Strings.formatStr(DM.getValidationMessage('DOCUMENTMODE', obj.type), obj.value),
            value: obj.value.replace("DocumentMode.","")
          }, r);

          countError(r);
          me.othersMes.push(r);
            
          d.resolve(c);

        } else {
          d.reject(c);
        }
      });

    } else {

      d.resolve(c);

    }

      return d.promise;
  };     

  </script>

</validation>
