const resovle = require('path').resolve;
const pathInfo = require('../path');

const moduleName = 'btc-guess';
const qaPublicPath = '';
const proPublicPath = '';
const qaOutputPath = resovle(pathInfo.pathOutput, `./qa/${moduleName}`);
const proOutputPath = resovle(pathInfo.pathOutput, `./pro/${moduleName}`);
const port = 3000;

const htmlWebpackPlugin = {
    defaultTitle: ''
};

const webPackDefinePlugin = {
    '__DEV__': false,
    '__QA__': false,
    '__PRE__': false,
    '__PRO__': false
};

module.exports = {
    moduleName,
    qaPublicPath,
    proPublicPath,
    qaOutputPath,
    proOutputPath,
    webPackDefinePlugin,
    htmlWebpackPlugin,
    port
};