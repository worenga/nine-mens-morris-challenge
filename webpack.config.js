const path = require('path');

const Uglify = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

var webpack = require('webpack')

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
        template:'./src/index.tpl.html',
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true
        },
      })
  ],

  devServer: {
       contentBase: './dist',
       historyApiFallback: true,
       noInfo: true,
       overlay: true
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
      },
    {
      test: /\.vue$/,
      loader: 'vue-loader'
    }
  ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  performance: {
    hints: false
  }
};



if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map';
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),

    new Uglify({
      sourceMap: true
    }),

    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ]);
}
