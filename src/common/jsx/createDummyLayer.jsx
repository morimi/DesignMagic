/**
 * @fileoverview ダミーレイヤーを作成する
 * @since version 0.4.0
 * http://chuwa.iobb.net/tech/JavaScriptToolsGuideCC_.pdf
 */

(function() {

try {

  var _width = 100;
  var _height = 100;
  var _name = _width + 'x' + _height + 'px';
  var _bgColor = "989ea9";
  var _textColor = "000000";
  var _fontStyle = 'ArialMT';
  var _shapeId;
  var _layerRef;
  var _resultValue;
  
  var _origUnit = preferences.rulerUnits;

  //backgroundColor(0～255)
  //http://curryegg.blog.shinobi.jp/scriptui/
  function UI_bgColor255(uiObj, uiColor) {
      var gColor = [];
      for(var i=0;i<3;i++){
          gColor[i] = 1/255*Math.round(uiColor[i]);
          //alert(gColor[i]);
      }
      var gUI = uiObj.graphics;
      var uiBrush = gUI.newBrush(gUI.BrushType.SOLID_COLOR, [gColor[0], gColor[1], gColor[2], 1]);
      gUI.backgroundColor = uiBrush;
  }

  //foregroundColor(0～255)
  function UI_fgColor255(uiObj, uiColor)
  {
      var gColor = [];
      for(var i=0;i<3;i++){
          gColor[i] = 1/255*Math.round(uiColor[i]);
          //alert(gColor[i]);
      }
      var gUI = uiObj.graphics;
      var uiPen = gUI.newPen(gUI.PenType.SOLID_COLOR, [gColor[0], gColor[1], gColor[2], 1], 1);
      gUI.foregroundColor = uiPen;
  }

  //backgroundColor(0～1)
  function UI_bgColor(uiObj, uiColor) {
    var gColor = [];
    gColor = uiColor;
    var gUI = uiObj.graphics;
    var uiBrush = gUI.newBrush(gUI.BrushType.SOLID_COLOR, [gColor[0], gColor[1], gColor[2], 1]);
    gUI.backgroundColor = uiBrush;
  }

  //foregroundColor(0～1)
  function  UI_fgColor(uiObj, uiColor) {
      var gColor = [];
      gColor = uiColor;
      var gUI = uiObj.graphics;
      var uiPen = gUI.newPen(gUI.PenType.SOLID_COLOR, [gColor[0], gColor[1], gColor[2], 1], 1);
      gUI.foregroundColor = uiPen;
  }

  //font
  function UI_font(uiObj, uiFont, uiFontStyle, uiFontSize) {
      var fontStyle = eval("ScriptUI.FontStyle." + uiFontStyle);
      var gFont = ScriptUI.newFont(uiFont, fontStyle, uiFontSize);
      uiObj.graphics.font = gFont;
  }

  //http://www.javascripter.net/faq/hextorgb.htm
  function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
  function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
  function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
  function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}

  //http://www.javascripter.net/faq/rgbtohex.htm
  function rgbToHex(R,G,B) {return toHex(R)+toHex(G)+toHex(B)}

  function toHex(n) {
   n = parseInt(n,10);
   if (isNaN(n)) return "00";
   n = Math.max(0,Math.min(n,255));
   return "0123456789ABCDEF".charAt((n-n%16)/16)
        + "0123456789ABCDEF".charAt(n%16);
  }

  function to255(num) {
    return Math.round((num / 10) * 255);
  }
  

  /**
   * レイヤー名を変更する
   * @param {striing} name レイヤー名
   */
  function changeLayerName(name) {
    var ref = new ActionReference();
    var desc = new ActionDescriptor();
    ref.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );
    desc.putReference( cTID( "null" ), ref );

    var desc54 = new ActionDescriptor();
    desc54.putString( cTID( "Nm  " ), name );
    desc.putObject( cTID( "T   " ), cTID( "Lyr " ), desc54 );
    executeAction( cTID( "setd" ), desc, DialogModes.NO );
  }

  /**
   * レイヤーをラスタライズする
   */
  function rasterizeLayer() {
    var desc814 = new ActionDescriptor();
    var ref493 = new ActionReference();
    ref493.putEnumerated( cTID( "Lyr " ), cTID( "Ordn" ), cTID( "Trgt" ) );
    desc814.putReference( cTID( "null" ), ref493 );
    executeAction( sTID( "rasterizeLayer" ), desc814, DialogModes.NO );
  }

  /**
   * フォントサイズの算出
   * 基準 100px : 16px
   */
  function getFontSize() {
    var r = _width / 100,
        f = Math.round(16 * r);
    return ( 30 < f ) ? 30 : (( f < 10 ) ? 10 : f);
  }
  
  
  function cTID(s) { return app.charIDToTypeID(s); };
  function sTID(s) { return app.stringIDToTypeID(s); };
  
  /////////////////////////////////

  /**
   * ダイアログを作成する
   */
  function createDialog() {

    //Create Window
    var win = new Window("dialog", "ダミー画像を作る");
    win.alignChildren = "fill";

    //画像のサイズ設定
    var sizePanel = win.add("panel", undefined, "画像のサイズ");
    sizePanel.orientation = "row";

    var widthGroup = sizePanel.add("group");
    widthGroup.orientation = "row";
    widthGroup.alignChildren = "left";
    widthGroup.add("statictext", undefined, "幅");

    var widthText = widthGroup.add("edittext", undefined, "100");
    widthText.preferredSize.width = 50;


    var markGroup = sizePanel.add("group");
    markGroup.orientation = "row";
    markGroup.alignChildren = "center";
    markGroup.add("statictext", undefined, "");
    markGroup.add("statictext", undefined, "×");

    var heightGroup = sizePanel.add("group");
    heightGroup.orientation = "row";
    heightGroup.alignChildren = "left";
    heightGroup.add("statictext", undefined, "高さ");
    var heightText = heightGroup.add("edittext", undefined, "100");
    heightText.preferredSize.width = 50;


    //カラー設定
    var colorPanel = win.add("panel", undefined, "カラー");
	colorPanel.orientation = "colmun";

    var colorGroup = colorPanel.add("group");
    colorGroup.orientation = "row";
    colorGroup.alignChildren = "left";

    //背景
    colorGroup.add("statictext", undefined, "背景色#");
    var bgColor = colorGroup.add("edittext", undefined, _bgColor);
    bgColor.preferredSize.width = 60;

    //文字色
    colorGroup.add("statictext", undefined, "文字色#");
    var textColor = colorGroup.add("edittext", undefined, _textColor);
    textColor.preferredSize.width = 60;

    //スライダー
    var sliderPanel = win.add("panel", undefined, "RGB Slider");
	sliderPanel.alignChildren = ["fill", "fill"];


	var gp3 = sliderPanel.add("group");
    gp3.orientation = "row";
    gp3.alignment ="center";

	var bgBtn = gp3.add("radiobutton", undefined, "背景色");
	var textBtn = gp3.add("radiobutton", undefined, "文字色");
	var lockBtn = gp3.add("checkbox", undefined, "ロック");
	bgBtn.value = true;

	var sliderRed = sliderPanel.add("slider", undefined, 5, 0, 10);
	var sliderGreen = sliderPanel.add("slider", undefined, 5, 0, 10);
	var sliderBlue = sliderPanel.add("slider", undefined, 5, 0, 10);


    //プレビュー
    var prevPanel = win.add("panel", undefined, "");
    prevPanel.orientation = "column";
    prevPanel.alignment = [ScriptUI.Alignment.FILL, ScriptUI.Alignment.FILL];

    var prevGroup = prevPanel.add("group");
    prevGroup.orientation = "row";
    prevGroup.alignChildren = "fill";
    prevGroup.add("statictext", undefined, '　　');

    var prevGroup2 = prevPanel.add("group");
    prevGroup2.orientation = "row";
    prevGroup2.alignChildren = "fill";
    var prevText = prevGroup2.add("statictext", undefined, _width + "x" + _height);
    UI_font( prevText, _fontStyle, "BOLD", 16 );

    var prevGroup3 = prevPanel.add("group");
    prevGroup3.orientation = "row";
    prevGroup3.alignChildren = "fill";
    prevGroup3.add("statictext", undefined, '　　');

    UI_bgColor255( prevPanel, [ hexToR("#" + _bgColor), hexToG("#" + _bgColor), hexToB("#" + _bgColor)] );

    ///決定・キャンセルボタン
    var buttons = win.add("group");
    buttons.orientation = "row";
    buttons.alignment = "center";

    //キャンセル
    var cancelBtn = buttons.add("button");
    cancelBtn.text = "キャンセル";
    cancelBtn.properties = {name: "cancel"};

    //決定
    var okBtn = buttons.add("button");
    okBtn.text = "決定";
    okBtn.properties = {name: "ok"};


    /// イベントハンドラ設定 ///

    //プレビューパネルの色変更
    var changeColor = function () {
      var r = to255(sliderRed.value);
      var g = to255(sliderGreen.value);
      var b = to255(sliderBlue.value);

      if ( bgBtn.value ) {
        bgColor.text = rgbToHex(r, g, b);
        UI_bgColor255( prevPanel, [ r, g, b ] );
      }

      if ( textBtn.value ) {
        textColor.text = rgbToHex(r, g, b);
        UI_fgColor255( prevPanel, [ r, g, b ] );
      }
    };

    //画像サイズによってフォントサイズ変更
    widthText.onChanging = function () {
      UI_font( prevText, _fontStyle, "BOLD", getFontSize() );
    };

    //カラースライダー
    sliderRed.onChanging = function()　{

      if( lockBtn.value ) {
        sliderGreen.value = sliderBlue.value = this.value;
      }
      changeColor();
	};

    sliderGreen.onChanging = function()　{

      if( lockBtn.value ) {
          sliderRed.value = sliderBlue.value = this.value;
      }
      changeColor();
	};

    sliderBlue.onChanging = function()　{

      if( lockBtn.value ) {
          sliderRed.value = sliderGreen.value = this.value;
      }
      changeColor();
	};

    //ボタン
    okBtn.onClick = function() {

      win.close();

      _width = parseInt(widthText.text);
      _height = parseInt(heightText.text);
      _bgColor = bgColor.text;
      _textColor = textColor.text;

      //createDummyLayer();
      activeDocument.suspendHistory("<%= Strings.Pr_HISTORY_CREATEDUMMYLAYER %>", "createDummyLayer()");
    };

    cancelBtn.onClick = function() {
      win.close();
      _resultValue = 'cancel';
    };


    win.center();
    var ret = win.show();
  };


  /**
   * 長方形ツールのレイヤー作成
   */
  function createSolidLayer() {
      var desc296 = new ActionDescriptor();
      var ref130 = new ActionReference();
      ref130.putClass( sTID( "contentLayer" ) );
      //ref130.putName( cTID( "Lyr " ), _name);
      desc296.putReference( cTID( "null" ), ref130 );

      var desc297 = new ActionDescriptor();
      var desc298 = new ActionDescriptor();
      var desc299 = new ActionDescriptor();

      desc299.putDouble( cTID( "Rd  " ), hexToR("#" + _bgColor) );
      desc299.putDouble( cTID( "Grn " ), hexToG("#" + _bgColor) );
      desc299.putDouble( cTID( "Bl  " ), hexToB("#" + _bgColor) );
      desc298.putObject( cTID( "Clr " ), cTID( "RGBC" ), desc299 );
      desc297.putObject( cTID( "Type" ), sTID( "solidColorLayer" ), desc298 );


      var dw = Math.round(activeDocument.width/2),
          dh = Math.round(activeDocument.height/2),
          top = dh - (_height / 2),
          left = dw - (_width / 2),
          bottom = dh + (_height / 2),
          right = dw + (_width / 2);


      var desc300 = new ActionDescriptor();
      desc300.putInteger( sTID( "unitValueQuadVersion" ), 1 );
      desc300.putUnitDouble( cTID( "Top " ), cTID( "#Pxl" ), top );
      desc300.putUnitDouble( cTID( "Left" ), cTID( "#Pxl" ), left );
      desc300.putUnitDouble( cTID( "Btom" ), cTID( "#Pxl" ), bottom);
      desc300.putUnitDouble( cTID( "Rght" ), cTID( "#Pxl" ), right);
      desc300.putUnitDouble( sTID( "topRight" ), cTID( "#Pxl" ), -1.000000 );
      desc300.putUnitDouble( sTID( "topLeft" ), cTID( "#Pxl" ), -1.000000 );
      desc300.putUnitDouble( sTID( "bottomLeft" ), cTID( "#Pxl" ), -1.000000 );
      desc300.putUnitDouble( sTID( "bottomRight" ), cTID( "#Pxl" ), -1.000000 );
      desc297.putObject( cTID( "Shp " ), cTID( "Rctn" ), desc300 );

  //枠線（一旦なしで）
  //    var desc301 = new ActionDescriptor();
  //    desc301.putInteger(  sTID( "strokeStyleVersion" ), 2 );
  //    desc301.putBoolean( sTID( "strokeEnabled" ), false );
  //    desc301.putBoolean( sTID( "fillEnabled" ), true );
  //    desc301.putUnitDouble( sTID( "strokeStyleLineWidth" ), cTID( "#Pnt" ), 1.000000 );
  //    desc301.putUnitDouble( sTID( "strokeStyleLineDashOffset" ), cTID( "#Pnt" ), 0.000000 );
  //    desc301.putDouble( sTID( "strokeStyleMiterLimit" ), 100.000000 );
  //    desc301.putEnumerated( sTID( "strokeStyleLineCapType" ), sTID( "strokeStyleLineCapType" ), sTID( "strokeStyleButtCap" ) );
  //    desc301.putEnumerated( sTID( "strokeStyleLineJoinType" ), sTID( "strokeStyleLineJoinType" ), sTID( "strokeStyleMiterJoin" ) );
  //
  //    desc301.putEnumerated( sTID( "strokeStyleLineAlignment" ), sTID( "strokeStyleLineAlignment" ), sTID( "strokeStyleAlignInside" ) );
  //    desc301.putBoolean( sTID( "strokeStyleScaleLock" ), false );
  //    desc301.putBoolean( sTID( "strokeStyleStrokeAdjust" ), false );
  //
  //    var list92 = new ActionList();
  //    desc301.putList( sTID( "strokeStyleLineDashSet" ), list92 );
  //    desc301.putEnumerated( sTID( "strokeStyleBlendMode" ), cTID( "BlnM" ), cTID( "Nrml" ) );
  //    desc301.putUnitDouble( sTID( "strokeStyleOpacity" ), cTID( "#Prc" ), 100.000000 ); //opacity

  //    var desc302 = new ActionDescriptor();
  //    var desc303 = new ActionDescriptor();
  //    desc303.putDouble( cTID( "Rd  " ), 209.000702 );
  //    desc303.putDouble( cTID( "Grn " ), 209.000702 );
  //    desc303.putDouble( cTID( "Bl  " ), 209.000702 );
  //    desc302.putObject( cTID( "Clr " ), cTID( "RGBC" ), desc303 );
  //    desc301.putObject( sTID( "strokeStyleContent" ), sTID( "solidColorLayer" ), desc302 );
  //    desc301.putDouble( sTID( "strokeStyleResolution" ), 72.000000 );
  //
  //    desc297.putObject( sTID( "strokeStyle" ), sTID( "strokeStyle" ), desc301 );

      desc296.putObject( cTID( "Usng" ), sTID( "contentLayer" ), desc297 );
      //desc296.putInteger( cTID( "LyrI" ), 17301 );
      executeAction( cTID( "Mk  " ), desc296, DialogModes.NO );

      rasterizeLayer();
      changeLayerName(_name);

      _shapeId = DM.getActiveLayerId();

      DM.selectLayerById(_shapeId); //選択状態にする

      _layerRef = activeDocument.activeLayer;

  }


  /**
   * テキストレイヤーを作成する
   */
  function createTextLayer() {

    var layer = activeDocument.artLayers.add();
    
    var dw = Math.round(activeDocument.width/2),
        dh = Math.round(activeDocument.height/2);

    layer.kind = LayerKind.TEXT;
    layer.name = 'Dummy_'+ _name;
    layer.blendMode = BlendMode.NORMAL;

    var textColor = new SolidColor;
    textColor.rgb.hexValue = _textColor;

    layer.textItem.contents = _width + 'x' + _height + 'px';

    layer.textItem.font = _fontStyle;
    layer.textItem.size = getFontSize();
    layer.textItem.color = textColor;

//    layer.textItem.fauxBold = true;
//    layer.textItem.fauxItalic = false;
//    layer.textItem.underline = UnderlineType.UNDERLINEOFF;
//    layer.textItem.capitalization = TextCase.NORMAL;
//    layer.textItem.antiAliasMethod = AntiAlias.SHARP;

    layer.textItem.position = [dw, dh + Math.round(layer.textItem.size/4)];
    layer.textItem.justification = Justification.CENTER;

    layer.rasterize(RasterizeType.TEXTCONTENTS); //ラスタライズ
    layer.move(_layerRef, ElementPlacement.PLACEBEFORE); //SHAPEレイヤーの前に移動させる
    layer.merge();

  }

 /**
   * ダミー作成実行関数
   * この関数はcreateDialog()で設定しているOKボタンのonClickイベントハンドラでsuspendHistoryにより実行される
   */
  function createDummyLayer() {
    
    preferences.rulerUnits = Units.PIXELS; //pixelでないと狂うので強制変更
    
    createSolidLayer(); //ベース作成
    createTextLayer(); //テキスト作成+マージ
    changeLayerName('Dummy_' + _name); //マージしたレイヤーの名前変更
    
    preferences.rulerUnits = _origUnit; //保存しておいた単位に戻す

  }

  if (documents.length > 0 ) {

    createDialog();

    return '{"status": 200}';

  } else {

    return '{"status": 404}';

  }

} catch(e) {
    return '{"type": "jsx", "message": "' + e + '", "status": 500}';
}

})();
