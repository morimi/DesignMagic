function noOpen() {
  return '{title: "ファイルが開かれていません", hint: "", type: "valid"}';
}

function checkMode() {
  if (activeDocument.mode !== DocumentMode.RGB) {
      var v;
      switch (activeDocument.mode) {
//            case DocumentMode.BITMAP :
//                    v = '白黒';
//                break;
          case DocumentMode.CMYK :
                  v = 'CMYK';
              break;
//            case DocumentMode.DUOTONE :
//                    v = 'ダブルトーン';
//                break;
//            case DocumentMode.GRAYSCALE :
//                    v = 'グレースケール';
//                break;
//            case DocumentMode.INDEXCOLOR :
//                    v = 'インデックスカラー';
//                break;
          case DocumentMode.LAB :
                  v = 'Labカラー';
              break;

          case DocumentMode.MULTICHANNEL :
                  v = 'マルチチャンネル';
              break;
          default :
              v = '';

      }

    return '{title: "カラーモードが' + v + 'です", hint: "RGBへ変更してください（イメージ→モード）", type: "error"}';

  } else {

    return '{title: "カラーモードはRGBです", hint: "", type: "valid"}';

  }

}

if (documents.length === 0 ) {
  noOpen();
} else {
  checkMode();
}


