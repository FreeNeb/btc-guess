const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');
const merge = require('webpack-merge');

const webpackDevConfig = merge(webpackBaseConfig, {
    devtool: 'inline-source-map',
    output: {
        publicPath: '/'
    },
    plugins: [
        new webpack.DefinePlugin({
            '__DEV__': true,
            '__QA__': false,
            '__QA_APP__': false,
            '__PRE__': false,
            '__PRO__': false,
            '__PRO_APP__': false
        }),
        new webpack.HotModuleReplacementPlugin()
    ]
});

// add hot-reload related code to entry chunks
Object.keys(webpackDevConfig.entry).forEach(function (name) {
    webpackDevConfig.entry[name] = ['./build/dev-client'].concat(
        webpackDevConfig.entry[name]);
});

module.exports = webpackDevConfig;
