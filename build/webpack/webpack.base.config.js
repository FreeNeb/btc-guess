// Node
require('colors');
// const fs = require('fs');
const path = require('path');
const ENV = (process.env.NODE_ENV || '').toUpperCase();
const webpack = require('webpack');
const fs = require('fs');

const objPath = require('../path');
const entryRoot = objPath.pathEntry;

const buildConfig = require('./config');

console.log('当前环境:');
console.log(ENV.red);

// Webpack plugins
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const extractCSS = new ExtractTextPlugin(`css/${buildConfig.moduleName}/${buildConfig.moduleName}-[name]-[hash].css`);
const extractSASS = new ExtractTextPlugin(`css/${buildConfig.moduleName}/${buildConfig.moduleName}-[name]-[hash].css`);

// Generate Entry
// Generate Entry
let pages = fs.readdirSync(entryRoot).filter(function (page) {
    return page.indexOf('.') !== 0;
});
let entry = {};

// html-webpack-plugin and config
let arrHTMLWebpackPlugin = [];
let bHash = true;
let bShowErrors = false;
let bMinify = {
    removeAttributeQuotes: true,
    collapseWhitespace: true,
    html5: true,
    minifyCSS: true,
    removeComments: true,
    removeEmptyAttributes: true,
};

let bMinifySass = true;

if (ENV === 'DEV' || ENV === 'RENDER') {
    bHash = false;
    bShowErrors = true;
    bMinify = false;

    bMinifySass = false;
}

if (ENV === 'DEV') {
    bHash = false;
    bShowErrors = true;
    bMinify = false;
}

pages.forEach(function (pageName) {
    if (pageName === 'config') {
        return;
    }

    entry[pageName] = `./src/page/${pageName}/${pageName}.js`;

    if (pageName === 'common') {
        return;
    }

    arrHTMLWebpackPlugin.push(new HtmlWebpackPlugin({
        title: pageName,
        filename: `${pageName}.html`,
        template: `./src/page/${pageName}/${pageName}.art`,
        chunks: ['common', pageName],
        chunksSortMode: function (a, b) {
            if (b.names[0] === 'common') {
                return 1;
            }
        },
        hash: bHash,
        showErrors: bShowErrors,
        minify: bMinify
    }));
});

module.exports = {
    entry: entry,
    output: {
        filename: `js/${buildConfig.moduleName}/[name]-[hash].js`,
        path: path.resolve(__dirname, 'output'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'stage-2']
                }
            }, {
                test: /\.art$/,
                loader: 'art-template-loader',
                query: {
                    minimize: false
                }
            }, {
                test: /\.vue$/,
                loader: [
                    {
                        loader: 'vue-loader',
                        options: {
                            loaders: {
                                css: extractCSS.extract([
                                    {
                                        use: 'css-loader',
                                        fallback: 'vue-style-loader' // <- 这是vue-loader的依赖，所以如果使用npm3，则不需要显式安装
                                    }
                                ]),
                                scss: extractSASS.extract([
                                    {
                                        loader: 'css-loader', // translates CSS into CommonJS
                                        options: {
                                            minimize: bMinifySass
                                        }
                                    }, {
                                        loader: 'sass-loader', // compiles Sass to CSS
                                        options: {
                                            includePaths: [objPath.pathCommonUIStyle]
                                        }
                                    }, {
                                        loader: 'sass-resources-loader',
                                        options: {
                                            resources: [path.resolve(objPath.pathCommonUIStyle, './sass/index.scss')]
                                        }
                                    }
                                ])
                            }
                        }
                    }
                ]
            }, {
                test: /\.css$/,
                loader: extractSASS.extract(['css-loader'])
            }, {
                test: /\.(png|jpg|jpeg|gif|svg)$/,
                loader: 'url-loader',
                options: {
                    limit: 1,
                    name: 'images/[name]-[hash].[ext]'
                }
            }, {
                test: /\.(eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                options: {
                    limit: 1,
                    name: 'font/[name]-[hash].[ext]'
                }
            }, {
                test: /\.(scss|sass)$/,
                use: extractSASS.extract([
                    {
                        loader: 'css-loader', // translates CSS into CommonJS
                        options: {
                            minimize: bMinifySass
                        }
                    }, {
                        loader: 'sass-loader', // compiles Sass to CSS
                        options: {
                            includePaths: [objPath.pathCommonUIStyle]
                        }
                    }, {
                        loader: 'sass-resources-loader',
                        options: {
                            resources: [path.resolve(objPath.pathCommonUIStyle, './sass/index.scss')]
                        }
                    }
                ])
            }, {
                test: require.resolve('zepto'),
                loader: 'exports-loader?window.Zepto!script-loader'
            }
        ]
    },
    plugins: [
        ...arrHTMLWebpackPlugin,
        new webpack
            .optimize
            .CommonsChunkPlugin({ name: 'common', filename: `js/${buildConfig.moduleName}/${buildConfig.moduleName}-[name]-[hash].js`, minChunks: 3 }),
        extractCSS,
        extractSASS
    ],
    resolve: {
        extensions: [
            '.js', '.ts', '.json', '.vue', '.css'
        ],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            COMMON_UI: objPath.pathCommonUI,
            COMMON_UI_STYLE: objPath.pathCommonUIStyle,
            COMMON_SERVICE: objPath.pathCommonService,
            COMMON_SERVICE_LIB: objPath.pathCommonServiceLib,
            COMPONENT: objPath.pathComponent,
            COMMON_MODULE: objPath.pathCommonModule,
            COMMON_PAGE: objPath.pathCommonPage,
            COMMON_COMPONENT: objPath.pathCommonComponent,
            THEME: objPath.pathTheme,
            PAGE: objPath.pathPage,
            MOCK: objPath.pathMock,
            CONFIG_BASE: objPath.pathConfigBase,
            VUE_SERVICE: objPath.pathVueService,
            COMMON_UTIL: objPath.pathCommonUtil
        }
    }
};
