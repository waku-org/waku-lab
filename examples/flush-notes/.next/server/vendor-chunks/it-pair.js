"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/it-pair";
exports.ids = ["vendor-chunks/it-pair"];
exports.modules = {

/***/ "(ssr)/./node_modules/it-pair/dist/src/duplex.js":
/*!*************************************************!*\
  !*** ./node_modules/it-pair/dist/src/duplex.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   duplexPair: () => (/* binding */ duplexPair)\n/* harmony export */ });\n/* harmony import */ var _index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./index.js */ \"(ssr)/./node_modules/it-pair/dist/src/index.js\");\n\n/**\n * Two duplex streams that are attached to each other\n */ function duplexPair() {\n    const a = (0,_index_js__WEBPACK_IMPORTED_MODULE_0__.pair)();\n    const b = (0,_index_js__WEBPACK_IMPORTED_MODULE_0__.pair)();\n    return [\n        {\n            source: a.source,\n            sink: b.sink\n        },\n        {\n            source: b.source,\n            sink: a.sink\n        }\n    ];\n} //# sourceMappingURL=duplex.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXQtcGFpci9kaXN0L3NyYy9kdXBsZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBa0M7QUFDbEM7O0NBRUMsR0FDTSxTQUFTQztJQUNaLE1BQU1DLElBQUlGLCtDQUFJQTtJQUNkLE1BQU1HLElBQUlILCtDQUFJQTtJQUNkLE9BQU87UUFDSDtZQUNJSSxRQUFRRixFQUFFRSxNQUFNO1lBQ2hCQyxNQUFNRixFQUFFRSxJQUFJO1FBQ2hCO1FBQ0E7WUFDSUQsUUFBUUQsRUFBRUMsTUFBTTtZQUNoQkMsTUFBTUgsRUFBRUcsSUFBSTtRQUNoQjtLQUNIO0FBQ0wsRUFDQSxrQ0FBa0MiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mbHVzaC1ub3Rlcy8uL25vZGVfbW9kdWxlcy9pdC1wYWlyL2Rpc3Qvc3JjL2R1cGxleC5qcz80MjE3Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHBhaXIgfSBmcm9tICcuL2luZGV4LmpzJztcbi8qKlxuICogVHdvIGR1cGxleCBzdHJlYW1zIHRoYXQgYXJlIGF0dGFjaGVkIHRvIGVhY2ggb3RoZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGR1cGxleFBhaXIoKSB7XG4gICAgY29uc3QgYSA9IHBhaXIoKTtcbiAgICBjb25zdCBiID0gcGFpcigpO1xuICAgIHJldHVybiBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHNvdXJjZTogYS5zb3VyY2UsXG4gICAgICAgICAgICBzaW5rOiBiLnNpbmtcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgc291cmNlOiBiLnNvdXJjZSxcbiAgICAgICAgICAgIHNpbms6IGEuc2lua1xuICAgICAgICB9XG4gICAgXTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWR1cGxleC5qcy5tYXAiXSwibmFtZXMiOlsicGFpciIsImR1cGxleFBhaXIiLCJhIiwiYiIsInNvdXJjZSIsInNpbmsiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/it-pair/dist/src/duplex.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/it-pair/dist/src/index.js":
/*!************************************************!*\
  !*** ./node_modules/it-pair/dist/src/index.js ***!
  \************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   pair: () => (/* binding */ pair)\n/* harmony export */ });\n/* harmony import */ var p_defer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! p-defer */ \"(ssr)/./node_modules/p-defer/index.js\");\n\n/**\n * A pair of streams where one drains from the other\n */ function pair() {\n    const deferred = (0,p_defer__WEBPACK_IMPORTED_MODULE_0__[\"default\"])();\n    let piped = false;\n    return {\n        sink: async (source)=>{\n            if (piped) {\n                throw new Error(\"already piped\");\n            }\n            piped = true;\n            deferred.resolve(source);\n        },\n        source: async function*() {\n            const source = await deferred.promise;\n            yield* source;\n        }()\n    };\n} //# sourceMappingURL=index.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXQtcGFpci9kaXN0L3NyYy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7OztBQUE0QjtBQUM1Qjs7Q0FFQyxHQUNNLFNBQVNDO0lBQ1osTUFBTUMsV0FBV0YsbURBQUtBO0lBQ3RCLElBQUlHLFFBQVE7SUFDWixPQUFPO1FBQ0hDLE1BQU0sT0FBT0M7WUFDVCxJQUFJRixPQUFPO2dCQUNQLE1BQU0sSUFBSUcsTUFBTTtZQUNwQjtZQUNBSCxRQUFRO1lBQ1JELFNBQVNLLE9BQU8sQ0FBQ0Y7UUFDckI7UUFDQUEsUUFBUztZQUNMLE1BQU1BLFNBQVMsTUFBTUgsU0FBU00sT0FBTztZQUNyQyxPQUFPSDtRQUNYO0lBQ0o7QUFDSixFQUNBLGlDQUFpQyIsInNvdXJjZXMiOlsid2VicGFjazovL2ZsdXNoLW5vdGVzLy4vbm9kZV9tb2R1bGVzL2l0LXBhaXIvZGlzdC9zcmMvaW5kZXguanM/ZDgzOSJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZGVmZXIgZnJvbSAncC1kZWZlcic7XG4vKipcbiAqIEEgcGFpciBvZiBzdHJlYW1zIHdoZXJlIG9uZSBkcmFpbnMgZnJvbSB0aGUgb3RoZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhaXIoKSB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSBkZWZlcigpO1xuICAgIGxldCBwaXBlZCA9IGZhbHNlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHNpbms6IGFzeW5jIChzb3VyY2UpID0+IHtcbiAgICAgICAgICAgIGlmIChwaXBlZCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignYWxyZWFkeSBwaXBlZCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGlwZWQgPSB0cnVlO1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShzb3VyY2UpO1xuICAgICAgICB9LFxuICAgICAgICBzb3VyY2U6IChhc3luYyBmdW5jdGlvbiogKCkge1xuICAgICAgICAgICAgY29uc3Qgc291cmNlID0gYXdhaXQgZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgIHlpZWxkKiBzb3VyY2U7XG4gICAgICAgIH0oKSlcbiAgICB9O1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIl0sIm5hbWVzIjpbImRlZmVyIiwicGFpciIsImRlZmVycmVkIiwicGlwZWQiLCJzaW5rIiwic291cmNlIiwiRXJyb3IiLCJyZXNvbHZlIiwicHJvbWlzZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/it-pair/dist/src/index.js\n");

/***/ })

};
;