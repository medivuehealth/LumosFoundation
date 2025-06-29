const path = require('path');
const webpack = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      path: require.resolve('path-browserify'),
      process: require.resolve('process/browser'),
      url: require.resolve('url/'),
    },
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
}; 