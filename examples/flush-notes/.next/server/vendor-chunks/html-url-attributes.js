"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/html-url-attributes";
exports.ids = ["vendor-chunks/html-url-attributes"];
exports.modules = {

/***/ "(ssr)/./node_modules/html-url-attributes/lib/index.js":
/*!*******************************************************!*\
  !*** ./node_modules/html-url-attributes/lib/index.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   urlAttributes: () => (/* binding */ urlAttributes)\n/* harmony export */ });\n/**\n * HTML URL properties.\n *\n * Each key is a property name and each value is a list of tag names it applies\n * to or `null` if it applies to all elements.\n *\n * @type {Record<string, Array<string> | null>}\n */ const urlAttributes = {\n    action: [\n        \"form\"\n    ],\n    cite: [\n        \"blockquote\",\n        \"del\",\n        \"ins\",\n        \"q\"\n    ],\n    data: [\n        \"object\"\n    ],\n    formAction: [\n        \"button\",\n        \"input\"\n    ],\n    href: [\n        \"a\",\n        \"area\",\n        \"base\",\n        \"link\"\n    ],\n    icon: [\n        \"menuitem\"\n    ],\n    itemId: null,\n    manifest: [\n        \"html\"\n    ],\n    ping: [\n        \"a\",\n        \"area\"\n    ],\n    poster: [\n        \"video\"\n    ],\n    src: [\n        \"audio\",\n        \"embed\",\n        \"iframe\",\n        \"img\",\n        \"input\",\n        \"script\",\n        \"source\",\n        \"track\",\n        \"video\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaHRtbC11cmwtYXR0cmlidXRlcy9saWIvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7OztBQUFBOzs7Ozs7O0NBT0MsR0FDTSxNQUFNQSxnQkFBZ0I7SUFDM0JDLFFBQVE7UUFBQztLQUFPO0lBQ2hCQyxNQUFNO1FBQUM7UUFBYztRQUFPO1FBQU87S0FBSTtJQUN2Q0MsTUFBTTtRQUFDO0tBQVM7SUFDaEJDLFlBQVk7UUFBQztRQUFVO0tBQVE7SUFDL0JDLE1BQU07UUFBQztRQUFLO1FBQVE7UUFBUTtLQUFPO0lBQ25DQyxNQUFNO1FBQUM7S0FBVztJQUNsQkMsUUFBUTtJQUNSQyxVQUFVO1FBQUM7S0FBTztJQUNsQkMsTUFBTTtRQUFDO1FBQUs7S0FBTztJQUNuQkMsUUFBUTtRQUFDO0tBQVE7SUFDakJDLEtBQUs7UUFDSDtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7S0FDRDtBQUNILEVBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mbHVzaC1ub3Rlcy8uL25vZGVfbW9kdWxlcy9odG1sLXVybC1hdHRyaWJ1dGVzL2xpYi9pbmRleC5qcz9kMmRjIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogSFRNTCBVUkwgcHJvcGVydGllcy5cbiAqXG4gKiBFYWNoIGtleSBpcyBhIHByb3BlcnR5IG5hbWUgYW5kIGVhY2ggdmFsdWUgaXMgYSBsaXN0IG9mIHRhZyBuYW1lcyBpdCBhcHBsaWVzXG4gKiB0byBvciBgbnVsbGAgaWYgaXQgYXBwbGllcyB0byBhbGwgZWxlbWVudHMuXG4gKlxuICogQHR5cGUge1JlY29yZDxzdHJpbmcsIEFycmF5PHN0cmluZz4gfCBudWxsPn1cbiAqL1xuZXhwb3J0IGNvbnN0IHVybEF0dHJpYnV0ZXMgPSB7XG4gIGFjdGlvbjogWydmb3JtJ10sXG4gIGNpdGU6IFsnYmxvY2txdW90ZScsICdkZWwnLCAnaW5zJywgJ3EnXSxcbiAgZGF0YTogWydvYmplY3QnXSxcbiAgZm9ybUFjdGlvbjogWydidXR0b24nLCAnaW5wdXQnXSxcbiAgaHJlZjogWydhJywgJ2FyZWEnLCAnYmFzZScsICdsaW5rJ10sXG4gIGljb246IFsnbWVudWl0ZW0nXSxcbiAgaXRlbUlkOiBudWxsLFxuICBtYW5pZmVzdDogWydodG1sJ10sXG4gIHBpbmc6IFsnYScsICdhcmVhJ10sXG4gIHBvc3RlcjogWyd2aWRlbyddLFxuICBzcmM6IFtcbiAgICAnYXVkaW8nLFxuICAgICdlbWJlZCcsXG4gICAgJ2lmcmFtZScsXG4gICAgJ2ltZycsXG4gICAgJ2lucHV0JyxcbiAgICAnc2NyaXB0JyxcbiAgICAnc291cmNlJyxcbiAgICAndHJhY2snLFxuICAgICd2aWRlbydcbiAgXVxufVxuIl0sIm5hbWVzIjpbInVybEF0dHJpYnV0ZXMiLCJhY3Rpb24iLCJjaXRlIiwiZGF0YSIsImZvcm1BY3Rpb24iLCJocmVmIiwiaWNvbiIsIml0ZW1JZCIsIm1hbmlmZXN0IiwicGluZyIsInBvc3RlciIsInNyYyJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/html-url-attributes/lib/index.js\n");

/***/ })

};
;