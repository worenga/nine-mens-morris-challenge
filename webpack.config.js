const path = require('path');

const Uglify = require("uglifyjs-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
var webpack = require('webpack')

module.exports = {
  entry: {
  	app: ['babel-polyfill','./src/app.main.js'],

    ai_random: ['babel-polyfill','./src/ai_random.worker.js'],
    ai_alphabeta: ['babel-polyfill','./src/ai_alphabeta.worker.js'],
    ai_maxq: ['babel-polyfill','./src/ai_maxq.worker.js'],
    ai_temporal: ['babel-polyfill','./src/ai_temporal.worker.js'],
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
      loader: 'vue-loader',
      options: {
        loaders: {
          scss: 'vue-style-loader!css-loader!sass-loader?' + JSON.stringify({
                            includePaths: [
                                path.resolve(__dirname, 'node_modules/compass-mixins/lib'),
                            ]
                        }), // <style lang="scss">

        }
      }
    },
    {
      test: /\.json$/,
      loader: 'json-loader'
    },
    {
      test: /\.scss$/,
      loader: 'vue-style-loader!css-loader!sass-loader?' + JSON.stringify({
                    includePaths: [
                              path.resolve(__dirname, 'node_modules/compass-mixins/lib'),
                          ]
                        })
    },
    {
      test: /.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
      use: [{
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
          outputPath: 'fonts/',    // where the fonts will go
          publicPath: '../'       // override the default path
        }
      }]
    },

  ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
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
    }),

    new FaviconsWebpackPlugin({
      logo:'./assets/favicon.png',
      title: 'Nine Men\'s Morris',
      emitStats: false,
      // Generate a cache file with control hashes and
      // don't rebuild the favicons until those hashes change
      persistentCache: true,
      // Inject the html into the html-webpack-plugin
      inject: true
    })

  ]);
}
