const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');
const merge = require('webpack-merge');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const CleanWebpackPlugin = require('clean-webpack-plugin');
const buildConfig = require('./config');

const projectRoot = path.resolve(__dirname, '../../');

let pathOutput = path.resolve(projectRoot, `./output/pro/${buildConfig.moduleName}/`);
let publicPath = `/${buildConfig.moduleName}/`;
let cleanPath = './output/pro/*';

const webpackPROConfig = merge(webpackBaseConfig, {
    output: {
        // filename: 'js/[name]-[hash].js',
        path: pathOutput,
        publicPath: publicPath
    },
    plugins: [
        new CleanWebpackPlugin(
            [cleanPath], // 匹配删除的文件
            {
                root: projectRoot, // 根目录
                verbose: true, // 开启在控制台输出信息
                dry: false // 启用删除文件, false为删除文件
            }
        ),
        new webpack.DefinePlugin({
            '__DEV__': false,
            '__QA__': false,
            '__QA_APP__': false,
            '__PRE__': false,
            '__PRO__': true,
            '__PRO_APP__': false,
            'process.env': {
                NODE_ENV: '"production"'
            }
        }),
        new UglifyJSPlugin({
            parallel: true,
            extractComments: false
        })
    ]
});

module.exports = webpackPROConfig;
