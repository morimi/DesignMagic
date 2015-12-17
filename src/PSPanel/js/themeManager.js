/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global window, document, CSInterface*/


/*

    Responsible for overwriting CSS at runtime according to CC app
    settings as defined by the end user.

*/

var themeManager = (function () {
    'use strict';

    var csInterface;

    /**
     * Convert the Color object to string in hexadecimal format;
     */
    function toHex(color, delta) {

        function computeValue(value, delta) {
            var computedValue = !isNaN(delta) ? value + delta : value;
            if (computedValue < 0) {
                computedValue = 0;
            } else if (computedValue > 255) {
                computedValue = 255;
            }

            computedValue = Math.floor(computedValue);

            computedValue = computedValue.toString(16);
            return computedValue.length === 1 ? "0" + computedValue : computedValue;
        }

        var hex = "";
        if (color) {
            hex = computeValue(color.red, delta) + computeValue(color.green, delta) + computeValue(color.blue, delta);
        }
        return hex;
    }


    function reverseColor(color, delta) {
        return toHex({
            red: Math.abs(255 - color.red),
            green: Math.abs(255 - color.green),
            blue: Math.abs(255 - color.blue)
        },
            delta);
    }


    function addRule(stylesheetId, selector, rule) {
        var stylesheet = document.getElementById(stylesheetId);

        if (stylesheet) {
            stylesheet = stylesheet.sheet;
            if (stylesheet.addRule) {
                stylesheet.addRule(selector, rule);
            } else if (stylesheet.insertRule) {
                stylesheet.insertRule(selector + ' { ' + rule + ' }', stylesheet.cssRules.length);
            }
        }
    }



    /**
     * Update the theme with the AppSkinInfo retrieved from the host product.
     */
    function updateThemeWithAppSkinInfo(appSkinInfo) {

      var body = document.body,
          className = "",
          baseClassName = body.className ? body.className + ' ': '';

        var rgbBgColor = appSkinInfo.panelBackgroundColor.color,
        cssBgColor = "#" + toHex(rgbBgColor);

        body.removeAttribute('class');

        if (process.platform.substr(0, 3) === "win") {
            baseClassName = baseClassName + "windows";
        }

       switch (rgbBgColor.red) {
        case 52:
            className = baseClassName + "darker";
            replaceImageSRC("light", "dark");
            break;
        case 83:
            className = baseClassName + "dark";
            replaceImageSRC("light", "dark");
            break;
        case 184:
            className = baseClassName + "light";
            replaceImageSRC("dark", "light");
            break;
        case 214:
            className = baseClassName + "lighter";
            replaceImageSRC("dark", "light");
            break;
          default:
            // unrecognized theme
            className = baseClassName + 'dark';
            break;
        }

      body.className = className;

        //$body.css({"background-color": cssBgColor});
      body.setAttribute('style', 'background-color:' + cssBgColor);
    }

    function getThemeColorType() {

      if (! csInterface) return null;

      var appSkinInfo = csInterface.hostEnvironment.appSkinInfo;
      var rgbBgColor = appSkinInfo.panelBackgroundColor.color;

      switch (rgbBgColor.red) {
        case 52:
            return "dark";
            break;
        case 83:
            return "dark";
            break;
        case 184:
            return "light";
            break;
        case 214:
            return "light";
            break;
        }

    }


    function replaceImageSRC(before, after) {
//      $.each($('img'), function(i, img) {
//        var $img = $(img);
//        var src = $img.attr('src').replace(before, after);
//        $img.attr('src', src);
//      });
    }


    function onAppThemeColorChanged(event) {
        var skinInfo = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
        updateThemeWithAppSkinInfo(skinInfo);
    }


    function init() {

        csInterface = new CSInterface();

        updateThemeWithAppSkinInfo(csInterface.hostEnvironment.appSkinInfo);

        csInterface.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, onAppThemeColorChanged);
    }

    return {
        init: init,
        getThemeColorType: getThemeColorType
    };

}());
