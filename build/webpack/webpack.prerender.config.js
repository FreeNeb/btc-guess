const webpack = require('webpack');
const webpackBaseConfig = require('./webpack.base.config.js');
const merge = require('webpack-merge');
const path = require('path');

const PrerenderSPAPlugin = require('prerender-spa-plugin');
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer;
const routes = require('../pre-render-routes');

const CleanWebpackPlugin = require('clean-webpack-plugin');

let projectRoot = path.resolve(__dirname, '../../');

let pathOutput = path.resolve(projectRoot, './output/pre-render/order-financing');
let publicPath = '/';
let cleanPath = './output/pre-render/*';
// let staticDir = path.resolve(projectRoot, './dist');

const webpackQAConfig = merge(webpackBaseConfig, {
    output: {
        // filename: 'js/[name]-[hash].js',
        path: pathOutput,
        publicPath: publicPath
    },
    plugins: [
        new CleanWebpackPlugin([cleanPath], { // 匹配删除的文件
            root: projectRoot, // 根目录
            verbose: true, // 开启在控制台输出信息
            dry: false // 启用删除文件, false为删除文件
        }), new
        webpack.DefinePlugin({ '__DEV__': false, '__QA__': true, '__PRE__': true, '__PRO__': false }), new
        PrerenderSPAPlugin({
            // Required - The path to the webpack-outputted app to prerender.staticDir: pathOutput,
            // Required - Routes to render.
            staticDir: pathOutput,
            routes: routes,
            minify: false,
            renderAfterTime: 100, renderer: new Renderer({
                headless: true
            }),
            // Optional - Allows you to customize the HTML and output path before
            // writing the rendered contents to a file.
            // renderedRoute can be modified and it or an equivelant should be returned.
            // renderedRoute format:
            // {
            //   route: String, // Where the output file will end up (relative to outputDir)
            //   originalRoute: String, // The route that was passed into the renderer, before redirects.
            //   html: String, // The rendered HTML for this route.
            //   outputPath: String // The path the rendered HTML will be written to.
            // // }
            postProcess(renderedRoute) {
                // Ignore any redirects.
                // renderedRoute.path = renderedRoute.originalPath;
                // Basic whitespace removal. (Don't use this in production.)
                // renderedRoute.html = renderedRoute.html.split(/>[\s]+</gmi).join('><');
                // // Remove /index.html from the output path if the dir name ends with a .html file extension.
                // // For example: /dist/dir/special.html/index.html -> /dist/dir/special.html
                // if (renderedRoute.path.endsWith('.html')) {
                //     renderedRoute.outputPath = path.join(__dirname, 'dist', renderedRoute.path);

                //     console.log(renderedRoute.outputPath, 11111111111);
                // }
                const r = renderedRoute.route.split('/');
                const fileName = r[r.length - 1];

                renderedRoute.outputPath = `${pathOutput}/${fileName}.html`;

                return renderedRoute;
            }
        })
    ]
}); module.exports = webpackQAConfig;