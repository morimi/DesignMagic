/*
* ADOBE CONFIDENTIAL
*
* Copyright (c) 2015 Adobe Systems Incorporated. All rights reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
*/

/*global csInterface*/

"use strict";

var fs = require("fs"),
    path = require("path"),
    _ = require("lodash");

var JSX_DIRECTORY = path.join(path.dirname(module.filename), "jsx");

// Cache for the template objects generated from the files.
var cache = {};

/**
 * @private
 *
 * Retrieve a JSX file from the jsx directory and convert it to a
 * lodash template. Also maintains a cache of previously loaded scripts.
 *
 * @param {string} scriptName Name of script file (without the extension) to load
 * @return {function} lodash template function
 */
function _getJSXTemplate(scriptName) {
    if (cache[scriptName]) {
        return cache[scriptName];
    }

    var text = fs.readFileSync(path.join(JSX_DIRECTORY, scriptName + ".jsx")),
        template = _.template(text);

    cache[scriptName] = template;

    return template;
}

/**
 * @private
 *
 * Evaluates the given script in Photoshop on the next tick.
 * (Crema team reported that csInterface.evalScript is slow and
 * put the call behind a defer()).
 *
 * @param {string} script Script text to evaluate
 * @param {function} callback Function to be called by csInterface with the result
 * @param {string} optScriptName Name of the JSX script (options)
 */
function _evalJSX(script, callback, optScriptName) {
    var self = this;
    _.defer(function () {
        window.csInterface.evalScript(script, function () {
          // 返却値に {errorType:type, errorMessage:message} が存在する場合はログに出力する。(jsxでエラーが発生した場合の処理)
          if (arguments[0] != window.EvalScript_ErrMessage) {
            var obj = (new Function("return " + arguments[0]))();
            try {
              if (obj.errorType == 'jsx') {
                console.log('[jsx error - ' + optScriptName + '] ' + obj.errorMessage);
                arguments[0] = null; //エラー用データを破棄
              }
            } catch(e) {
              // obj.errorType が undefined というエラーが表示されるので握りつぶす.
            }
          }
          callback.apply(self, arguments);
        });
    });
}

/**
 * Runs the JSX named script, merging the given data with the template
 * in the script file. The callback given is called when complete.
 *
 * @param {string} scriptName Name of the JSX script (without the extension)
 * @param {object} data Data to merge into the template
 * @param {function} callback Called when the script has been evaluated
 */
function runJSX(scriptName, data, callback) {
    var template = _getJSXTemplate(scriptName),
        rendered = template(data);

    _evalJSX(rendered, callback, scriptName);
}

exports.runJSX = runJSX;
