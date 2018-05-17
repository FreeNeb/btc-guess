'use strict';

let contractAddress = 'n1oXdmwuo5jJRExnZR5rbceMEyzRsPeALgm';

let nebulas = require('nebulas'),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
// https://github.com/nebulasio/nebPay
let NebPay = require('nebpay'),
    nebPay = new NebPay();

neb.setRequest(new nebulas.HttpRequest('https://testnet.nebulas.io'));


// call的方式调用合约, 不走transaction
let call = function(func, args, callback) {
    let from = Account.NewAccount().getAddressString();
    let value = '0';
    let nonce = '0';
    let gas_price = '1000000';
    let gas_limit = '2000000';
    let contract = {
        'function': func,
        'args': args
    };

    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        console.log('return of rpc call: ' + JSON.stringify(resp.result));
        callback(resp);
    }).catch(function (err) {
        console.log('error:' + err.message);
    });
};

// 通过发送交易的方式调用合约
let callWithPay = function(func, args, value, callback) {
    let to = dappAddress;
    // 使用nebpay的call接口去调用合约,
    let serialNumber = nebPay.call(to, value, func, args, {
        listener: callback
    });
    return serialNumber;
};

// 查询交易状态
function funcIntervalQuery(tradeNumber, callback) {
    // search transaction result from server (result upload to server by app)
    nebPay.queryPayInfo(tradeNumber).then(function (resp) {
        console.log('tx result: ' + resp);   // resp is a JSON string
        let respObject = JSON.parse(resp);
        callback(respObject);
    }).catch(function (err) {
        console.log(err);
    });
}
