/**
 * @fileoverview 単位設定のチェック
 */

try {

  var mes = [];

  if ( !!"<%= config['rulerUnitsType'] %>" ) {
    //定規
    if (preferences.rulerUnits !== Units["<%= config.rulerUnitsType %>"] ) {
      mes.push('{name:"RULER_UNITS", value: "' + preferences.rulerUnits + '", type: "error"}');
    } else {
      mes.push('{name:"RULER_UNITS", value: "' + preferences.rulerUnits + '", type: "valid"}');
    }
  }

  /**
   * @since version 0.3.0
   */
  if ( !!"<%= config['typeUnitsType'] %>" ) {
    //文字
    if (preferences.typeUnits !== TypeUnits["<%= config.typeUnitsType %>"] ) {
      mes.push('{name:"TYPE_UNITS", value: "' + preferences.typeUnits + '", type: "error"}');
    } else {
      mes.push('{name:"TYPE_UNITS", value: "' + preferences.typeUnits + '", type: "valid"}');
    }
  }


  if ( mes.length ) {
    '{list:[' + mes.join(',') + ']}';

  } else {
    '{list:[]}';
  }


} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
