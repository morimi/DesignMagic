if (preferences.rulerUnits !== Units.PIXELS ) {

  var v;

  switch(preferences.rulerUnits) {

      case Units.CM:
          v = 'cm';
          break;
      case Units.INCHES :
          v = 'inch';
          break;
      case Units.MM :
          v = 'mm';
          break;
      case Units.PERCENT :
          v = '%';
          break;
      case Units.PICAS :
          v = 'pica';
          break;
      case Units.POINTS :
          v = 'pt';
          break;

  }

  '{title: "単位が' + v + 'です", hint: "ピクセルに変更してください（環境設定→単位・定規）", type: "error"}';

} else {
  '{title: "単位はPixelです", hint: "", type: "valid"}';
}
