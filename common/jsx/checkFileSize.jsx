/**
 * @fileoverview activeDocument のファイルサイズチェック
 */


if (documents.length > 0 ) {
  var obj = new File(activeDocument.fullName);
  var size = Math.round((obj.length / 1000000) * 10) / 10;
  var limit = Math.abs('<%= config.size %>');

  if ( limit && size > limit ) {
    '{title: "ファイルサイズが規定を超えています", hint: ["規定:' + limit + 'MB　現在:' + size + 'MB"], type: "warn"}';

  } else if ( limit && size < limit ){
    '{title: "ファイルサイズは規定の範囲内です", hint: ["規定:' + limit + 'MB　現在:' + size + 'MB"], type: "valid"}';
  } else {
    '{title: "ファイルサイズは ' + size + 'MB です", hint: "", type: "valid"}';
  }
}
