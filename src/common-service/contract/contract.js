// call的方式调用合约, 不走transaction
import nebulas from 'nebulas';
import NebPay from 'nebpay';
import { NEBULAS_CHAIN } from 'CONFIG_BASE/config';
import Promise from 'promise';

// const Account = nebulas.Account;
const neb = new nebulas.Neb();
const nebPay = new NebPay();

let urlNebularRequest = NEBULAS_CHAIN.PRO;

if (!__PRO__) {
    urlNebularRequest = NEBULAS_CHAIN.TEST;
}

neb.setRequest(new nebulas.HttpRequest(urlNebularRequest));

let contractApiInstance = null;

class ContractAPI {
    constructor(addrContract) {
        if (contractApiInstance !== null) {
            return contractApiInstance;
        }

        if (!addrContract) {
            throw new Error('ContractAPI 需要一个合约地址');
        }

        this.addrContract = addrContract;
    }

    call(fromAddr, func, ...args) {
        let from = fromAddr;
        if (__DEV__) {
            // from = 'n1Ky9E9BxJXiGFKVVKhDKMHZ9griE4b48Yj';
        }
        let value = '0';
        let nonce = '0';
        let gas_price = '1000000';
        let gas_limit = '2000000';
        let contract = {
            'function': func,
            'args': JSON.stringify(args)
        };

        return neb.api.call(from, this.addrContract, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
            return JSON.parse(resp.result);
        }).catch(function (err) {
            console.log('error:' + err.message);
        });
    }

    callByWallet(payAmount, contractFunc, options = {}, ...contractFuncArgs) {
        if (payAmount <= 0) {
            throw new Error('交易金额必须大于0');
        }
        let tradeNum = nebPay.call(this.addrContract, payAmount, contractFunc, JSON.stringify(contractFuncArgs), options);
        let intervalQuery;
        return new Promise((resolve, reject) => {
            intervalQuery = setInterval(function() {
                nebPay.queryPayInfo(tradeNum)   // search transaction result from server (result upload to server by app)
                    .then(function (resp) {
                        let respObject = JSON.parse(resp);
                        if (respObject.code === 0) {
                            // 交易成功, 处理相关任务
                            clearInterval(intervalQuery);    // 清除定时查询

                            resolve(respObject);
                        } else {
                            reject(respObject);
                        }
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }, 5000);
        });
    }
}

export { ContractAPI };