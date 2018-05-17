const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');
const merge = require('webpack-merge');
const path = require('path');

const CleanWebpackPlugin = require('clean-webpack-plugin');

let projectRoot = path.resolve(__dirname, '../../');

let pathOutput = path.resolve(projectRoot, './output/qa/invest');
let publicPath = '/mimosawx/invest/';
let cleanPath = './output/qa/*';

const webpackQAConfig = merge(webpackBaseConfig, {
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
            '__QA__': true,
            '__PRE__': false,
            '__PRO__': false
        })
    ]
});

module.exports = webpackQAConfig;
