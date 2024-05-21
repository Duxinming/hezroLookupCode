const webpack = require('webpack')
module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.argv': JSON.stringify(process.argv),
      }),
    ],
  },
}
