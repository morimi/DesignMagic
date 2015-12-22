/**
 * @fileoverview layerSets & artLayersの命名チェック (ActionReference版)
 */
(function(){
try {
  
var SELECTED_LAYER = activeDocument.activeLayer;

/**
 * メッセージ用コード
 */
var VALIDATION_HINT = {
  NONAME : "NONAME",
  BLENDMODE: "BLENDMODE",
  FONT_ABSVALUE: "FONT_ABSVALUE",
  FONT_MINSIZE : "FONT_MINSIZE",
  FONT_EMPTY : "FONT_EMPTY"
};

/**
 * タイプ
 */
var VALIDATION_TYPE = {
  WARN: "warn",
  ERROR: "error"
};

/**
 * エラーメッセージ文字列格納用
 * @type {Array.<string>}
 */
var mes = [];


/**
 * 命名チェックレベル毎の正規表現
 * 0 : レイヤー、グループ のコピー のみ
 * 1 : Lv0 + シェイプ
 * 2 : Lv0-1 + 全ての矩形(多角形,楕円形,長方形,角丸長方形)
 */
var NAME_REGEX = {
  0 : /<%= Strings.Pr_LAYER_NAME_REGEX_0 %>/,
  1 : /<%= Strings.Pr_LAYER_NAME_REGEX_1 %>/,
  2 : /<%= Strings.Pr_LAYER_NAME_REGEX_2 %>/
};


/**
 * Hidden Layer Count
 */
var h = 0;

/**
 * 設定の値
 */
    //命名 (boolean -> string)
var CONF_LAYERS_NAME = "<%= config.layers.name %>" === 'true',
    //ブレンドモード (boolean -> string)
    CONF_LAYERS_BLENDMODE = "<%= config.layers.blendingMode %>" === 'true',
    //フォントサイズが整数かどうかチェックする (boolean -> string)
    CONF_FONTS_ABSVALUE = "<%= config.fonts.absValue %>" === 'true',
    //最小サイズ (number)
    CONF_FONTS_MINSIZE = parseInt("<%= config.fonts.minSize %>");

/**
 *
 */
var RULERUNITS = {
  'Units.CM': 'cm',
  'Units.INCHES': 'inch',
  'Units.MM': 'mm',
  'Units.PERCENT': '%',
  'Units.PICAS': 'pica',
  'Units.POINTS': 'pt',
  'Units.PIXELS': 'px'
};


/**
 * @requires checkLayers.jsx
 * @param {string} title
 * @param {Array} hint
 * @param {string} type
 * @param {string} kind LayerKind
 * @return {string} stringifyした文字列
 */
function resultToString(id, index, title, hint, type, kind) {
  //return JSON.stringify(this.data); JSON使えないよ

  var text = '{id: ' + id + ', index: ' + index + ', title:"' + title + '", hint:[';

  for ( var i = 0, l = hint.length; i < l; i++ ) {
    text += '"' + hint[i] + '"' + ',';
  }
  text = text.slice(0, -1); //末尾の , を切る
  text += '], type:"' + type + '",'
  text += 'kind: "' + kind + '",'
  text += '}';

  return  text;

};

/**
 * テキストレイヤーの拡大率を得る
 * @private
 * @param {string} direction 縦または横を指定 'yy' or 'xx'
 * @param {ActionDescriptor} desc getObjectValue(stringIDToTypeID('textKey')) の値
 * @return {number} 拡大率
 * @see https://forums.adobe.com/thread/1954020
 */
function getTextScale(direction, desc) {
  if (desc.hasKey(stringIDToTypeID('transform'))) {
    var transform = desc.getObjectValue(stringIDToTypeID('transform'));
    var mFactor = transform.getUnitDoubleValue (stringIDToTypeID(direction));
    return mFactor;
  }
  return 1;
}
  
/**
 * 拡大率を考慮したフォントサイズを得る（文字パネルと同じ値）
 * @param {ActionDescriptor} desc getObjectValue(stringIDToTypeID('textKey')) の値
 * @return {number} フォントサイズ
 * @see https://forums.adobe.com/thread/1954020
 */
function getTextSize(desc) {
  var pixels = desc.getList(stringIDToTypeID('textStyleRange'))
                     .getObjectValue(0)
                     .getObjectValue(stringIDToTypeID('textStyle'))
                     .getDouble (stringIDToTypeID('size'));

  var scale = getTextScale('yy', desc);

  return Math.round((pixels * scale) * 100) / 100;
}
  
  
//https://github.com/kieranpblack/Photoshop-Scripts/blob/master/getLayerKindByID.jsx
function getLayerKind(desc) {

  var layerType = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
  if(layerType == 'layerSectionStart') return 'LayerSet';
  if(layerType != 'layerSectionContent') return;
  if(desc.hasKey(stringIDToTypeID('textKey'))) return LayerKind.TEXT;
  if(desc.hasKey(stringIDToTypeID('smartObject'))) return LayerKind.SMARTOBJECT;
  if(desc.hasKey(stringIDToTypeID('layer3D'))) return LayerKind.LAYER3D;
  if(desc.hasKey(stringIDToTypeID('adjustment'))){
    switch(typeIDToStringID(desc.getList(stringIDToTypeID('adjustment')).getClass(0))){
      case 'photoFilter' : return LayerKind.PHOTOFILTER;
      case 'solidColorLayer' : return LayerKind.SOLIDFILL;
      case 'gradientMapClass' : return LayerKind.GRADIENTMAP;
      case 'gradientMapLayer' : return LayerKind.GRADIENTFILL;
      case 'hueSaturation' : return LayerKind.HUESATURATION;
      case 'colorLookup' : return;
      case 'colorBalance' : return LayerKind.COLORBALANCE;
      case 'patternLayer' : return LayerKind.PATTERNFILL;
      case 'invert' : return LayerKind.INVERSION;
      case 'posterization' : return LayerKind.POSTERIZE;
      case 'thresholdClassEvent' : return LayerKind.THRESHOLD;
      case 'blackAndWhite' : return LayerKind.BLACKANDWHITE;
      case 'selectiveColor' : return LayerKind.SELECTIVECOLOR;
      case 'vibrance' : return LayerKind.VIBRANCE;
      case 'brightnessEvent' : return LayerKind.BRIGHTNESSCONTRAST;
      case 'channelMixer' : return LayerKind.CHANNELMIXER;
      case 'curves' : return LayerKind.CURVES;
      case 'exposure' : return LayerKind.EXPOSURE;
      default : return typeIDToStringID(desc.getList(stringIDToTypeID('adjustment')).getClass(0));
    }
  }
  return LayerKind.NORMAL;
}


/////////////////////
  
  if (documents.length !== 0 ) {
    
    // the file;
    var myDocument = app.activeDocument;

    // レイヤーとグループの総数を得る
    var ref = new ActionReference();
    ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );

    var i = 1, l = executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers")),
        nameRegex = NAME_REGEX["<%= config.layers.namingLevel %>"];
    
    while ( i <= l ) {
      var hint = [];
      var type = VALIDATION_TYPE.WARN;
      var ref2 = new ActionReference();
      ref2.putIndex( charIDToTypeID( "Lyr " ), i);
      var desc = executeActionGet(ref2);
      var layerSet = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID("layerSection")));
      var isBackground = desc.getBoolean(stringIDToTypeID("background"));
        
      // if not layer group collect values;
      if ( layerSet != "layerSectionEnd" ) {
        var name = desc.getString(stringIDToTypeID('name'));
        var id = desc.getInteger(stringIDToTypeID('layerID'));
        var kind = desc.getInteger(stringIDToTypeID("layerKind"));
        var blendMode = typeIDToStringID(desc.getEnumerationValue( stringIDToTypeID( 'mode' )));
        var kindObj = getLayerKind(desc);
        var isVisible = desc.getBoolean(stringIDToTypeID( 'visible'));
        
        switch ( kind ) {
            case 3: //text
              var textDesc = desc.getObjectValue(stringIDToTypeID('textKey'));
              var textContent = textDesc.getString(stringIDToTypeID("textKey"));

              if ( !textContent.length ) {
                //内容がないよう
                hint.push(VALIDATION_HINT.FONT_EMPTY);
                type = VALIDATION_TYPE.ERROR;
                
              } else {
                
                var textSize = getTextSize(textDesc);
                
                //フォントサイズの整数を判定
                if ( /\./.test(textSize) && CONF_FONTS_ABSVALUE ) {
                  hint.push(VALIDATION_HINT.FONT_ABSVALUE);
                }

                //最小フォンとサイズ
                if( (textSize <  CONF_FONTS_MINSIZE) && (0 < CONF_FONTS_MINSIZE) ) {
                  hint.push(VALIDATION_HINT.FONT_MINSIZE);
                }
              }
            
            break;
            
          default:
            
            //命名
            if ( nameRegex.test(name) && CONF_LAYERS_NAME) {
              hint.push(VALIDATION_HINT.NONAME);
            }
            
            break;
        
        }//switch
        
        
        //ブレンドモード（LayerSet以外をチェック）
        //※LayerSetはデフォが通過のためエラーとして判断してしまうため
        if ( blendMode !== 'passThrough' && blendMode!== 'normal' && CONF_LAYERS_BLENDMODE) {
          hint.push(VALIDATION_HINT.BLENDMODE);
          type = VALIDATION_TYPE.ERROR;
        }
            
        
        //非表示レイヤーカウント
        h = (h + !isVisible)|0;

        if ( hint.length ) {
          mes.push(resultToString(id, i, name, hint, type, kindObj));
        }

      }//if
     
      i = (i+1)|0;
      
    } //while
    
    if ( mes.length ) {
      return '{hidden: "' + h + '", list:[' + mes.join(',') + ']}';

    } else {
      return '{hidden: "' + h + '", list:[]}';
    }

  }//if
    
} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
})();
