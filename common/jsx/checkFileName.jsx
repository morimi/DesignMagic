/**
 * @fileoverview activeDocument のファイル名チェック
 */



function noOpen() {
  return '{title: "ファイルが開かれていません", hint: "", type: "valid"}';
}

function check() {
  var reg = '<%= config.name[0] %>',
      reg2 = '<%= config.name[1] %>';

  var reg3 = new RegExp(reg, reg2),
      name = activeDocument.name.split('.')[0];


  if (! name.match(reg3)) {

    return '{title: "ファイル名が命名規則と一致しません", hint: "' + reg3 +' に当てはまるよう変更してください", type: "error"}';

  } else {

    return '{title: "ファイル名は規定に沿って設定されています", hint: "", type: "valid"}';

  }

}

if (documents.length === 0 ) {
  noOpen();
} else {
  check();
}

