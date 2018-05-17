import {
    isAfter,
    isBefore,
    isBoolean,
    isCurrency,
    isEmail,
    isEmpty,
    isLength,
    isMobilePhone,
    isNumeric,
    isURL
} from 'validator';

function isMobile (strMobile) {
    return isMobilePhone(strMobile, 'zh-CN');
}

/*
 * arrRule，待验证数据集合
 * 没个数据项内容为：
 * arrRule[idx] = {
 *      name: 'name',
 *      value: 'value',
 *      valid: {
 *          dataType: 'string',
 *          required: true,
 *          ...
 *      }
 * }
 */
function validateAll (objRuleList) {
    let bPass = true;

    for (let strKey in objRuleList) {
        if ({}.hasOwnProperty.call(objRuleList, strKey)) {
            let objRule = objRuleList[strKey];

            objRule.validRet = !!(validateSingle(objRule));
            if (!validateSingle(objRule)) {
                bPass = false;
            }
        }
    }

    return bPass;
}

function validateSingle (objRule) {
    if (Object.prototype.toString.call(objRule) !== '[object Object]') {
        return false;
    }

    let bPass = true;
    let objValid = objRule.valid;
    for (let strKey in objValid) {
        if ({}.hasOwnProperty.call(objValid, strKey)) {
            switch (strKey.toLowerCase()) {
            case 'datatype':
                switch (objValid[strKey].toLowerCase()) {
                case 'number':
                    if (!isNumeric(objRule.value)) {
                        bPass = false;
                    }
                    break;
                case 'email':
                    if (!isEmail(objRule.value)) {
                        bPass = false;
                    }
                    break;
                case 'url':
                    if (!isURL(objRule.value)) {
                        bPass = false;
                    }
                    break;
                case 'mobile':
                    if (!isMobile(objRule.value)) {
                        bPass = false;
                    }
                    break;
                }
                break;
            case 'required':
                if (isEmpty(objRule.value)) {
                    bPass = false;
                }
                break;
            case 'minlen':
                if (!isLength(objRule.value, { min: objValid[strKey] })) {
                    bPass = false;
                }
                break;
            case 'maxlen':
                if (!isLength(objRule.value, { min: objValid[strKey] })) {
                    bPass = false;
                }
                break;
            }
        }
    }

    return bPass;
}

export {
    isAfter,
    isBefore,
    isBoolean,
    isCurrency,
    isEmail,
    isEmpty,
    isLength,
    isMobile,
    isNumeric,
    isURL,
    validateAll,
    validateSingle
};