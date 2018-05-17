const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
// const proxy = require('http-proxy-middleware');

const childProcess = require('child_process');

const app = express();
const webpackDevConfig = require('./webpack/webpack.dev.config.js');
const compiler = webpack(webpackDevConfig);

const buildConfig = require('./webpack/config');

console.log('页面入口为:');
console.log(webpackDevConfig.entry);

const hotMiddleware = webpackHotMiddleware(compiler);
// Reload page after html-webpack-plugin template file update
compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data,
        cb) {
        hotMiddleware.publish({
            action: 'reload'
        });
        cb();
    });
});

// serve mock api
// app.use('/mock', express.static('./mock'));
app.all('/mock/*', function (req, res) {
    res.sendfile('.' + req.path);
});

// serve mock api
// app.get('/', function (req, res) {
//     res.sendfile('./index.html');
// });

// Tell express to use the webpack-dev-middleware and use the webpack.config.js
// configuration file as a base.
app.use(webpackDevMiddleware(compiler, {
    publicPath: webpackDevConfig.output.publicPath,
    lazy: false,
    stats: {
        colors: true,
        chunks: false
    }
}));

app.use(hotMiddleware);

// Serve the files on port 3000.
let port = buildConfig.port;
app.listen(port, function () {
    console.log('访问地址:');
    console.log(`http://127.0.0.1:${port}`);
});

childProcess.exec(`open -a "Google Chrome" http://127.0.0.1:${port}/`);
