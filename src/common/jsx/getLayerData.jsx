/**
 * @fileoverview 渡されたIDを元にレイヤー/グループ名の情報を返す
 * 得られる情報は、{"id": 237, "title": "レイヤー 6", "index": 32, "kind": "LayerKind.NORMAL"}
 * @since version 0.4.0
 */

(function() {

  try {

    function getLayerData() {
      var ref = new ActionReference();

      ref.putIdentifier(charIDToTypeID("Lyr "), parseInt("<%= data.id %>"));
      var desc = executeActionGet(ref);

      return {
        id: desc.getInteger( stringIDToTypeID( "layerID" ) ),
        name: desc.getString(charIDToTypeID( "Nm  " )),
        index: desc.getInteger( charIDToTypeID( 'ItmI' ) ),
        kind: getLayerKind(desc)
      };

    }

    //
    //https://github.com/kieranpblack/Photoshop-Scripts/blob/master/getLayerKindByID.jsx
    function getLayerKind(desc) {

      var layerType = typeIDToStringID(desc.getEnumerationValue(stringIDToTypeID('layerSection')));
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


  if (documents.length !== 0 ) {

    var d = getLayerData();

    return '{"id": ' + d.id + ', "title": "' + d.name + '", "index": ' + d.index + ', "kind": "' + d.kind + '"}';

  }

  } catch(e) {
    return '{errorType: "jsx", errorMessage: "' + e + '"}';
  }
})();
