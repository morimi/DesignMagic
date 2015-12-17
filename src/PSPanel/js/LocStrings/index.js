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

/*global localeStrings */

"use strict";

/**
 * Format a string by replacing placeholder symbols with passed in arguments.
 *
 * Example: var formatted = Strings.formatStr("Hello {0}", "World");
 *
 * @param {string} str The base string
 * @param {...} Arguments to be substituted into the string
 *
 * @return {string} Formatted string
 */
function formatStr(str) {
    // arguments[0] is the base string, so we need to adjust index values here
    var args = [].slice.call(arguments, 1);
    return str.replace(/\{(\d+)\}/g, function (match, num) {
        return typeof args[num] !== "undefined" ? args[num] : match;
    });
}

module.exports = window.localeStrings;
module.exports.formatStr = formatStr;
