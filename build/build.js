require('colors');

const timerStart = Number(new Date());

const NODE_ENV = process.env.NODE_ENV;
const Webpack = require('webpack');
const ora = require('ora');

let webpackConfig;
if (NODE_ENV === 'qa') {
    webpackConfig = require('./webpack/webpack.qa.config.js');
} else if (NODE_ENV === 'qa_app') {
    webpackConfig = require('./webpack/webpack.qa.app.config.js');
} else if (NODE_ENV === 'production') {
    webpackConfig = require('./webpack/webpack.pro.config.js');
} else if (NODE_ENV === 'production-app') {
    webpackConfig = require('./webpack/webpack.pro.app.config.js');
    process.env.NODE_ENV = 'production';
}

console.log('页面入口为:');
console.log(webpackConfig.entry);

console.log('正在打包... \n打包环境:');
console.log(NODE_ENV.toUpperCase().red);

// https://github.com/sindresorhus/ora
let spinner = ora('building for ' + NODE_ENV + '...');
spinner.start();

Webpack(webpackConfig, function (err, stats) {
    spinner.stop();
    if (err) throw err;

    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n');

    console.log('产出目录...');
    console.log(webpackConfig.output.path.red + '\n\n');

    const timerEnd = Number(new Date());

    console.log('打包耗时：');
    console.log(String(timerEnd - timerStart).yellow + 'ms\n\n');

    // console.log('开始压缩成zip，压缩文件路径为：');
    // console.log(zipPath.red);

    // let zip = new admZip();
    // zip.addLocalFolder(zipPath);
    // zip.writeZip(zipPath + '/invest.zip');

    // console.log('压缩完成');

    // if (NODE_ENV === 'qa' || NODE_ENV === 'qa_app') {
    //      // todo 自动部署到 QA 环境
    //     fs.readFile(zipPath + '/invest.zip', 'utf-8', function (err, data) {
    //         if (err) {
    //         console.log("FATAL An error occurred trying to read in the file: " + err);
    //         process.exit(-2);
    //         }

    //         if(data) {
    //         }
    //         else {
    //             console.log("No data to post");
    //             process.exit(-1);
    //         }
    //     });
    // }
});
