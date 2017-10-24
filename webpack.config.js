const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
  	app: ['babel-polyfill','./src/app.main.js'],

    ai_random: ['babel-polyfill','./src/ai_random.worker.js'],
    ai_alphabeta: ['babel-polyfill','./src/ai_alphabeta.worker.js'],
  },

  plugins: [
      new CleanWebpackPlugin(['dist']),
      new HtmlWebpackPlugin({
        chunks:['app'],
        template:'./src/index.tpl.html'
      })
  ],

  devServer: {
       contentBase: './dist'
  },

  devtool: 'inline-source-map',

  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: ['transform-runtime']
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js' // 'vue/dist/vue.common.js' for webpack 1
    }
  }
};
