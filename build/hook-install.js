const resolve = require('path').resolve;
const childProcess = require('child_process');

let pathGitHook = resolve(__dirname, '../.git/hooks/');
let pathHooks = resolve(__dirname, '../hooks');

childProcess.exec(`cp ${pathHooks}/* ${pathGitHook}`);
childProcess.exec(`chmod +x ${pathGitHook}/*`);