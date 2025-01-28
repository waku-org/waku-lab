// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true;
config.resolver.extraNodeModules = {
  "url": path.resolve(__dirname, "node_modules", "react-native-url-polyfill"),
};

module.exports = config;
