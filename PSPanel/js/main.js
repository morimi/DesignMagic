/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

(function () {
  'use strict';

  var csInterface = new CSInterface();
      //,localeStrings = csInterface.initResourceBundle();


  //Modules
  var Handlebars  = require("handlebars"),
      _           = require("lodash"),
      Q           = require("Q"),
      JSXRunner   = require("../common/JSXRunner");

  //Elements
  var $content = $('#content'),
      $list = $('#message-list');

  var template = Handlebars.compile($('#message-template').html());


  //Init
  function init() {

    themeManager.init();

    JSXRunner.runJSX("checkDocumentMode", null, function (result) {
      //http://hamalog.tumblr.com/post/4047826621/json-javascript
      var obj = (new Function("return " + result))();
      $list.append(template(obj));
    });

    JSXRunner.runJSX("checkRulerUnits", null, function (result) {
      //http://hamalog.tumblr.com/post/4047826621/json-javascript
      var obj = (new Function("return " + result))();
      $list.append(template(obj));
    });


    JSXRunner.runJSX("checkLayerName", null, function (result) {
      //http://hamalog.tumblr.com/post/4047826621/json-javascript
      var array = (new Function("return " + result))();
      _.each(array, function(obj) {
        $list.prepend(template(obj));
      });

    });

    $('#message-list').on('click', '.message', function(e) {
        alert($(this).text())
    });

  }


  //素のinit()ではaddClassが想定通り動かんので
  $(document).ready(init);

}());

