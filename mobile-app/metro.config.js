const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require('path');

const config = getDefaultConfig(__dirname);

// Isolation: Force Metro to only watch the mobile-app directory
// and not scan the parent website directory.
config.watchFolders = [path.resolve(__dirname)];

// Blocklist: Explicitly ignore any parent node_modules if found
config.resolver.blockList = [
  /node_modules\/.*\/node_modules/,
  /website\/node_modules/
];

module.exports = withNativeWind(config, { input: "./global.css" });
