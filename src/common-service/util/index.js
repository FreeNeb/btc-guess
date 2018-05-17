// 宿主环境检测
let ua = (navigator.userAgent || '').toLowerCase();

let BROWSER = {
    isAndroid () {
        return ua.indexOf('android') > -1 || ua.indexOf('adr') > -1;
    },
    isIOS () {
        return ua.indexOf('iphone') > -1 || ua.indexOf('ipad') > -1;
    },
    isWechat () {
        return ua.indexOf('micromessenger') > -1;
    },
    isEbk () {
        return ua.indexOf('html5plus') > -1;
    },
    isPC () {
        return !(this.isAndroid() || this.isIOS() || this.isWechat() || this.isEbk());
    },
};

// extend
let extend = require('extend');

// 格式化日期, dateFormat(now, "dddd, mmmm dS, yyyy, h:MM:ss TT");
let _dateFormat = require('dateformat');
// dateFormat.i18n = require('./datefomat/language-zh-cn');
let dateFormat = function (datetime, formatStyle) {
    let datDatetime = datetime;
    if (!datDatetime) {
        datDatetime = new Date();
    } else if (datetime.toString().length === 8) {
        // 兼容20171109这样的格式
        datDatetime = new Date(`${datetime.substr(0, 4)}-${datetime.substr(4, 2)}-${datetime.substr(6, 2)}`);
    }

    return _dateFormat(datetime, formatStyle);
};

// 格式化数字
let numberFormat = require('format-number');

// URL 相关功能
let _urlNpm = require('url');
// 格式化 url
// let urlFormat = function (url, params) {
//     params = params && Object.keys(params).map(function (key) {
//         return [key, params[key]].map(encodeURIComponent).join('=');
//     }).join('&');

//     return params ? url + (url.indexOf('?') >= 0 ? '&' : '?') + params : url;
// };
let urlFormat = function (url, params) {
    let objUrl = _urlNpm.parse(url, true);
    let objQuery = objUrl.query;
    objUrl.query = extend(objQuery, params);
    delete objUrl.search;

    return _urlNpm.format(objUrl);
};

// 获取 url 参数
let getUrlParamByName = function (name, url) {
    if (BROWSER.isEbk() && !url) {
        let objMuiUrlParam = (plus && plus.webview.currentWebview()) || {};
        return objMuiUrlParam[name];
    }

    let _url = url || location.search || '';

    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)');
    let r = (_url.split('?')[1] || '').match(reg);
    if (r != null) {
        return unescape(r[2]);
    }
    return null;
};

let getUrlParams = function (url) {
    let _url = url;
    if (BROWSER.isEbk() && !_url) {
        let objMuiUrlParam = (plus && plus.webview.currentWebview()) || {};
        return objMuiUrlParam;
    }

    if ('string' !== typeof _url) {
        _url = location.href;
    }

    let objUrlInfo = _urlNpm.parse(_url, true);
    return objUrlInfo.query;
};

// 加载 js，https://www.npmjs.com/package/load-script
let loadScript = require('load-script');

let isUrl = function (url) {
    let regUrl = /(ht|f)tp(s?):\/\/[0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*(:(0-9)*)*(\/?)([a-zA-Z0-9\-.?,'/\\+&amp;%$#_]*)/;

    return regUrl.test(url);
};

let randomNum = function (min, max) {
    let iMin = Number(min) || 0;
    let iMax = Number(max ? 0 : max) || 0;

    if (iMax <= iMin) {
        return iMin;
    }

    return Math.floor(Math.random() * (iMax - iMin + 1) + iMin);
};

// 人民币金额转大写
let rmbToUppercase = function (amount) {
    let n = amount;
    let fraction = ['角', '分'];
    let digit = [
        '零', '壹', '贰', '叁', '肆',
        '伍', '陆', '柒', '捌', '玖'
    ];
    let unit = [
        ['元', '万', '亿'],
        ['', '拾', '佰', '仟']
    ];
    let head = n < 0 ? '欠' : '';
    n = Math.abs(n);
    let s = '';
    for (let i = 0; i < fraction.length; i++) {
        s += (digit[Math.floor(n * 10 * Math.pow(10, i)) % 10] + fraction[i]).replace(/零./, '');
    }
    s = s || '整';
    n = Math.floor(n);
    for (let i = 0; i < unit[0].length && n > 0; i++) {
        let p = '';
        for (let j = 0; j < unit[1].length && n > 0; j++) {
            p = digit[n % 10] + unit[1][j] + p;
            n = Math.floor(n / 10);
        }
        s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
    }
    return head + s.replace(/(零.)*零元/, '元')
        .replace(/(零.)+/g, '零')
        .replace(/^整$/, '零元整');
};

export {
    BROWSER,
    extend,
    dateFormat,
    numberFormat,
    urlFormat,
    getUrlParamByName,
    getUrlParams,
    loadScript,
    isUrl,
    randomNum,
    rmbToUppercase
};