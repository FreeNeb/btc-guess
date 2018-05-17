const resolve = require('path').resolve;

const pathProject = resolve(__dirname, '../');
const pathSrc = resolve(pathProject, './src');

const pathCommonUI = resolve(pathSrc, './common-ui');
const pathCommonService = resolve(pathSrc, './common-service');

const pathMock = resolve(pathProject, './mock');
const pathEntry = resolve(pathProject, './src/page');

const pathCommonUIStyle = resolve(pathCommonUI, './style');
const pathTheme = resolve(pathCommonUIStyle, './theme');
const pathCommonComponent = resolve(pathCommonUI, './component');

const pathCommonServiceLib = resolve(pathCommonService, './lib');
const pathVueService = resolve(pathCommonService, './vue');
const pathCommonUtil = resolve(pathCommonService, './util');

const pathConfigBase = resolve(pathSrc, './config');
const pathCommonModule = resolve(pathSrc, './common');
const pathCommonPage = resolve(pathSrc, './page/common');
const pathComponent = resolve(pathSrc, './component');
const pathPage = resolve(pathSrc, './page');

const pathOutput = resolve(pathProject, './output');

module.exports = {
    pathProject,
    pathSrc,
    pathCommonUI,
    pathCommonService,
    pathMock,
    pathEntry,
    pathCommonUIStyle,
    pathTheme,
    pathCommonComponent,
    pathCommonServiceLib,
    pathVueService,
    pathCommonUtil,
    pathConfigBase,
    pathCommonModule,
    pathCommonPage,
    pathComponent,
    pathPage,
    pathOutput,
};