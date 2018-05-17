require('colors');

const timerStart = Number(new Date());

const NODE_ENV = process.env.NODE_ENV;
const Webpack = require('webpack');
const ora = require('ora');

let webpackConfig = require('./webpack/webpack.prerender.config.js');

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

    // 格式化 html
    console.log('准备格式化HTML: '.red);
    setTimeout(() => {
        const fs = require('fs');
        const path = require('path');
        const formatter = require('html-formatter');
        const routes = require('./pre-render-routes');

        const publicPath = webpackConfig.output.publicPath;

        routes.forEach((rt) => {
            // let pathHtmlFile = path.resolve(webpackConfig.output.path, `.${r}/index.html`);

            // console.log('格式化HTML: ', pathHtmlFile.yellow);

            // if (fs.existsSync(pathHtmlFile)) {
            //     let content = fs.readFileSync(pathHtmlFile, { encoding: 'utf8' });
            //     let contentFormatter = formatter.render(content);

            //     fs.writeFileSync(pathHtmlFile, contentFormatter);
            // }

            const r = rt.split('/');
            const pageName = r[r.length - 1];
            let pathHtmlFile = path.resolve(webpackConfig.output.path, `./${pageName}.html`);

            console.log('格式化HTML: ', pathHtmlFile.yellow);

            if (fs.existsSync(pathHtmlFile)) {
                let content = fs.readFileSync(pathHtmlFile, { encoding: 'utf8' });
                let contentFormatter = formatter.render(content);

                contentFormatter = contentFormatter.replace(/src="\//g, `src=".${publicPath}`).replace(/href="\//g, `href=".${publicPath}`);

                fs.writeFileSync(pathHtmlFile, contentFormatter);
            }
        });

        fs.unlinkSync(`${webpackConfig.output.path}/index.html`);

        const pathCssDir = path.resolve(webpackConfig.output.path, './css');
        const pathImagesDir = path.resolve(webpackConfig.output.path, './images');
        const pathFontDir = path.resolve(webpackConfig.output.path, './font');

        const pathImagesRelative = path.relative(pathCssDir, pathImagesDir);
        const pathFontRelative = path.relative(pathCssDir, pathFontDir);

        const arrCss = fs.readdirSync(pathCssDir);

        // 替换 css 中 images 的路径
        arrCss.forEach((cssFileName) => {
            const pathCssFile = path.resolve(pathCssDir, `./${cssFileName}`);

            if (fs.existsSync(pathCssFile)) {
                let content = fs.readFileSync(pathCssFile, { encoding: 'utf8' });

                content = content.replace(/\/images/g, pathImagesRelative).replace(/\/font/g, pathFontRelative);

                fs.writeFileSync(pathCssFile, content);
            }
        });
    }, 1000);


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
