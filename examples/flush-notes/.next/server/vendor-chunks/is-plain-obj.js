"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/is-plain-obj";
exports.ids = ["vendor-chunks/is-plain-obj"];
exports.modules = {

/***/ "(ssr)/./node_modules/is-plain-obj/index.js":
/*!********************************************!*\
  !*** ./node_modules/is-plain-obj/index.js ***!
  \********************************************/
/***/ ((module) => {

eval("\nmodule.exports = (value)=>{\n    if (Object.prototype.toString.call(value) !== \"[object Object]\") {\n        return false;\n    }\n    const prototype = Object.getPrototypeOf(value);\n    return prototype === null || prototype === Object.prototype;\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXMtcGxhaW4tb2JqL2luZGV4LmpzIiwibWFwcGluZ3MiOiJBQUFBO0FBRUFBLE9BQU9DLE9BQU8sR0FBR0MsQ0FBQUE7SUFDaEIsSUFBSUMsT0FBT0MsU0FBUyxDQUFDQyxRQUFRLENBQUNDLElBQUksQ0FBQ0osV0FBVyxtQkFBbUI7UUFDaEUsT0FBTztJQUNSO0lBRUEsTUFBTUUsWUFBWUQsT0FBT0ksY0FBYyxDQUFDTDtJQUN4QyxPQUFPRSxjQUFjLFFBQVFBLGNBQWNELE9BQU9DLFNBQVM7QUFDNUQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mbHVzaC1ub3Rlcy8uL25vZGVfbW9kdWxlcy9pcy1wbGFpbi1vYmovaW5kZXguanM/MGQ5NiJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gdmFsdWUgPT4ge1xuXHRpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHRjb25zdCBwcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpO1xuXHRyZXR1cm4gcHJvdG90eXBlID09PSBudWxsIHx8IHByb3RvdHlwZSA9PT0gT2JqZWN0LnByb3RvdHlwZTtcbn07XG4iXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInZhbHVlIiwiT2JqZWN0IiwicHJvdG90eXBlIiwidG9TdHJpbmciLCJjYWxsIiwiZ2V0UHJvdG90eXBlT2YiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/is-plain-obj/index.js\n");

/***/ })

};
;