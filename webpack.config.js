const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  entry: {
    'afct': './js/afct.js',
    'bundle': ["./css/history.css", "./css/responsive.css"]
  },
  output: {
    path: path.resolve(__dirname, 'dist/'),
    filename: '[name].min.js',
    // contenthash busts the 1-year browser cache when a lazy chunk changes
    // (the WP version query only covers the entry file)
    chunkFilename: '[name].[contenthash:8].chunk.min.js',
    clean: true,
    publicPath: 'auto'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ]
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin(),
      new CssMinimizerPlugin()
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].min.css'
    })
  ],
  mode: 'production'
};