"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-electron";
exports.ids = ["vendor-chunks/is-electron"];
exports.modules = {

/***/ "(ssr)/./node_modules/is-electron/index.js":
/*!*******************************************!*\
  !*** ./node_modules/is-electron/index.js ***!
  \*******************************************/
/***/ ((module) => {

eval("// https://github.com/electron/electron/issues/2288\n\nfunction isElectron() {\n    // Renderer process\n    if (false) {}\n    // Main process\n    if (typeof process !== \"undefined\" && typeof process.versions === \"object\" && !!process.versions.electron) {\n        return true;\n    }\n    // Detect the user agent when the `nodeIntegration` option is set to false\n    if (typeof navigator === \"object\" && typeof navigator.userAgent === \"string\" && navigator.userAgent.indexOf(\"Electron\") >= 0) {\n        return true;\n    }\n    return false;\n}\nmodule.exports = isElectron;\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXMtZWxlY3Ryb24vaW5kZXguanMiLCJtYXBwaW5ncyI6IkFBQUEsbURBQW1EOztBQUNuRCxTQUFTQTtJQUNMLG1CQUFtQjtJQUNuQixJQUFJLEtBQStGLEVBQVksRUFFOUc7SUFFRCxlQUFlO0lBQ2YsSUFBSSxPQUFPRSxZQUFZLGVBQWUsT0FBT0EsUUFBUUUsUUFBUSxLQUFLLFlBQVksQ0FBQyxDQUFDRixRQUFRRSxRQUFRLENBQUNDLFFBQVEsRUFBRTtRQUN2RyxPQUFPO0lBQ1g7SUFFQSwwRUFBMEU7SUFDMUUsSUFBSSxPQUFPQyxjQUFjLFlBQVksT0FBT0EsVUFBVUMsU0FBUyxLQUFLLFlBQVlELFVBQVVDLFNBQVMsQ0FBQ0MsT0FBTyxDQUFDLGVBQWUsR0FBRztRQUMxSCxPQUFPO0lBQ1g7SUFFQSxPQUFPO0FBQ1g7QUFFQUMsT0FBT0MsT0FBTyxHQUFHViIsInNvdXJjZXMiOlsid2VicGFjazovL2ZsdXNoLW5vdGVzLy4vbm9kZV9tb2R1bGVzL2lzLWVsZWN0cm9uL2luZGV4LmpzPzNlZjYiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gaHR0cHM6Ly9naXRodWIuY29tL2VsZWN0cm9uL2VsZWN0cm9uL2lzc3Vlcy8yMjg4XG5mdW5jdGlvbiBpc0VsZWN0cm9uKCkge1xuICAgIC8vIFJlbmRlcmVyIHByb2Nlc3NcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHdpbmRvdy5wcm9jZXNzID09PSAnb2JqZWN0JyAmJiB3aW5kb3cucHJvY2Vzcy50eXBlID09PSAncmVuZGVyZXInKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIE1haW4gcHJvY2Vzc1xuICAgIGlmICh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MudmVyc2lvbnMgPT09ICdvYmplY3QnICYmICEhcHJvY2Vzcy52ZXJzaW9ucy5lbGVjdHJvbikge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBEZXRlY3QgdGhlIHVzZXIgYWdlbnQgd2hlbiB0aGUgYG5vZGVJbnRlZ3JhdGlvbmAgb3B0aW9uIGlzIHNldCB0byBmYWxzZVxuICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbmF2aWdhdG9yLnVzZXJBZ2VudCA9PT0gJ3N0cmluZycgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdFbGVjdHJvbicpID49IDApIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGlzRWxlY3Ryb247XG4iXSwibmFtZXMiOlsiaXNFbGVjdHJvbiIsIndpbmRvdyIsInByb2Nlc3MiLCJ0eXBlIiwidmVyc2lvbnMiLCJlbGVjdHJvbiIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImluZGV4T2YiLCJtb2R1bGUiLCJleHBvcnRzIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/is-electron/index.js\n");

/***/ })

};
;