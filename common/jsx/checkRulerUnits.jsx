/**
 * @fileoverview 単位のチェック
 */

try {

var LABEL = {
  CM: 'cm',
  INCHES: 'inch',
  MM: 'mm',
  PERCENT: '%',
  PICAS: 'pica',
  POINTS: 'pt',
  PIXELS: 'px'
};

if (preferences.rulerUnits !== Units["<%= config.rulserUnitsType %>"] ) {

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

  '{title: "単位が' + v + 'です", hint: "' + LABEL["<%= config.rulserUnitsType %>"] + 'に変更してください（環境設定→単位・定規）", type: "error"}';

} else {
  '{title: "単位は' + LABEL["<%= config.rulserUnitsType %>"] + 'に設定されています", hint: "", type: "valid"}';
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
