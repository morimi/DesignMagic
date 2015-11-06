/**
 * @fileoverview Ratioチェック
 *
 * activgeDocumentの幅(width)で判定する
 * check.files.ratio
 * 1 -> 320
 * 2 -> 640
 * 3 -> 960
 * 4 -> 1280
 */

try {

var RATIO = parseFloat('<%= config.ratio %>'),
    value = RATIO * 320;

if ( documents.length > 0 ) {
  if ( activeDocument.width !== value ) {

    '{title: "カンバスサイズが規定と異なっています", hint: ["幅を「' + value + 'px」に設定してください"], type: "error"}';

  } else {

    '{title: "カンバスサイズは規定通りに設定されています", hint: [], type: "valid"}';

  }
}

} catch(e) {
  '{errorType: "jsx", errorMessage: "' + e + '"}';
}
