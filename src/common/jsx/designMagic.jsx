var DM = {};


/**
 * テキストレイヤーの拡大率を得る
 * @private
 * @param {string} direction 縦または横を指定 'yy' or 'xx'
 * @param {ActionDescriptor} desc getObjectValue(stringIDToTypeID('textKey')) の値
 * @return {number} 拡大率
 * @see https://forums.adobe.com/thread/1954020
 */
DM.getTextScale = function(direction, desc) {
  if (desc.hasKey(stringIDToTypeID('transform'))) {
    var transform = desc.getObjectValue(stringIDToTypeID('transform'));
    var mFactor = transform.getUnitDoubleValue (stringIDToTypeID(direction));
    return mFactor;
  }
  return 1;
};
  
/**
 * 拡大率を考慮したフォントサイズを得る（文字パネルと同じ値）
 * @param {ActionDescriptor} desc getObjectValue(stringIDToTypeID('textKey')) の値
 * @return {number} フォントサイズ
 * @see https://forums.adobe.com/thread/1954020
 */
DM.getTextSize = function(desc) {
  var pixels = desc.getList(stringIDToTypeID('textStyleRange'))
                     .getObjectValue(0)
                     .getObjectValue(stringIDToTypeID('textStyle'))
                     .getDouble (stringIDToTypeID('size'));

  var scale = DM.getTextScale('yy', desc);
  
  return Math.round((pixels * scale) * 100) / 100;
};
  
/**
 * 渡されたActionDescriptorのkey等でkindを判別してLayerKind形式で返す
 * https://github.com/kieranpblack/Photoshop-Scripts/blob/master/getLayerKindByID.jsx
 * @param {ActionDescriptor} desc Class ActionDescriptor instance
 * @return {LayerKind}
 */
DM.getLayerKind = function(desc) {

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
};


/**
 * レイヤーとグループの総数を返す
 * @return {number} indexの最大値と同じ値を返す。indexは1から始まるので注意
 */
DM.getNumberOfLayers = function() {
  var ref = new ActionReference();
  ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
  return executeActionGet(ref).getInteger(stringIDToTypeID("numberOfLayers"));
};


/**
 * IDを元にレイヤーを選択する
 * @param {number} id レイヤーのID
 */
DM.selectLayerById = function(id) {
  var desc = new ActionDescriptor();
  var ref = new ActionReference();

  ref.putIdentifier(charIDToTypeID("Lyr "), id);
  desc.putReference( charIDToTypeID( "null" ), ref );
  desc.putBoolean( charIDToTypeID( "MkVs" ), false );
  executeAction(  charIDToTypeID( "slct" ), desc, DialogModes.NO );
};


/**
 * IDで指定したレイヤー名を変更する
 * @param {number} id レイヤーのID
 * @param {striing} name レイヤー名
 */
DM.changeLayerNameById = function(id, name) {
  var ref = new ActionReference();
  var desc = new ActionDescriptor();
  ref.putIdentifier(charIDToTypeID("Lyr "), id);
  desc.putReference( charIDToTypeID( "null" ), ref );

  desc.putBoolean( charIDToTypeID( "MkVs" ), false );
  executeAction(  charIDToTypeID( "slct" ), desc, DialogModes.NO );

  var desc2 = new ActionDescriptor();
  desc2.putString( charIDToTypeID( "Nm  " ), name );
  desc.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Lyr " ), desc2 );
  executeAction( charIDToTypeID( "setd" ), desc, DialogModes.NO );
};


'{"status": 200}';