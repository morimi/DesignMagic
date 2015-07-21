/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
  'use strict';

  var csInterface = new CSInterface()
      //,localeStrings = csInterface.initResourceBundle();


  //Modules
  var Handlebars  = require("handlebars"),
      _           = require("lodash");


  //Elements
  var $content = $('#content'),
      $list = $('#message-list');


  function showMessage() {
    var template = Handlebars.compile($('#message-template').html());

    var data = [
      { title: 'レイヤー1', hint: '名前がありません', type: 'error'},
      { title: 'レイヤー2', hint: '名前がありません', type: 'error'},
      { title: 'レイヤー3', hint: '名前がありません', type: 'warn'},
      { title: 'レイヤー4', hint: '名前がありません', type: 'error'},
      { title: 'レイヤー5', hint: '名前がありません', type: 'warn'}
    ];

    _.each(data, function(dat) {
      $list.append(template(dat));
    });
  }


  //Init
  function init() {
    themeManager.init();


    showMessage();
  }


  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

}());

