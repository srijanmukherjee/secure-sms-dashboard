const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  projectRoot: __dirname,
  watchFolders: [path.resolve(__dirname, '../common')],
  resolver: {
    extraNodeModules: {
      common: path.resolve(__dirname, '../common'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
