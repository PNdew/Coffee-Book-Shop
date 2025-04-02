const { getDefaultConfig } = require("expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

// Remove web mapping since we're handling it differently
delete defaultConfig.resolver.extraNodeModules;

module.exports = defaultConfig;
