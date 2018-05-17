'use strict';

// 资金
let Stake = function(json) {
    if (json) {
        let o = JSON.parse(json);
        this.balance = new BigNumber(o.balance);
        this.betInfos = o.betInfos;
    } else {
        this.balance = new BigNumber(0);
        this.betInfos = [];
    }
};
Stake.prototype.toString = function() {
    return JSON.stringify(this);
};

// 游戏
let MarketIndexGame = function(json) {
    if (json) {
        let o = JSON.parse(json);
        this.id = o.id;
        this.startIndex = o.startIndex;   // 开盘价
        this.endIndex = o.endIndex;   // 收盘价
        this.upInfos = o.upInfos; // 押涨的信息
        this.upTotalMoney = new BigNumber(o.upTotalMoney);   // 押涨的总金额
        this.downInfos = o.downInfos;   // 押跌的信息
        this.downTotalMoney = new BigNumber(o.downTotalMoney);   // 押跌的总金额
        this.equalInfos = o.equalInfos;  // 押平的信息
        this.equalTotalMoney = new BigNumber(o.equalTotalMoney);  // 押平的总金额
        this.startTimeStr = o.startTimeStr;   // 开盘时间 string('10:00')
        this.endTimeStr = o.endTimeStr;   // 收盘时间 string('10:05')
        this.state = o.state;  // 状态 （'init': 押注, 'start': 停止押注，等最后结果，'end': 结束)
    }
    else {
        this.id = 0;
        this.startIndex = '-';
        this.endIndex = '-';
        this.upInfos = [];
        this.upTotalMoney = new BigNumber(0);
        this.downInfos = [];
        this.downTotalMoney = new BigNumber(0);
        this.equalInfos = [];
        this.equalTotalMoney = new BigNumber(0);
        this.startTimeStr = '-';
        this.endTimeStr = '-';
        this.state = 'init';
    }
};
MarketIndexGame.prototype.toString = function() {
    return JSON.stringify(this);
};

let MarketIndexGuessContract = function () {
    LocalContractStorage.defineMapProperty(this, 'stakes', {
        parse: function (text) {
            return new Stake(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'games', {
        parse: function (text) {
            return new MarketIndexGame(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, 'balance', null);
    LocalContractStorage.defineProperty(this, 'gameIds', null);
};

// save value to contract, only after height of block, users can takeout
MarketIndexGuessContract.prototype = {
    init: function () {
        this.balance = new BigNumber(0);
        this.gameIds = '[]';
    },

    /**
     * 往合约地址转token， height不用传
     * 转的token数量就是transaction中的value值
     */
    save: function (height) {
        let from = Blockchain.transaction.from;
        let value = Blockchain.transaction.value;

        let orig_stake = this.stakes.get(from);
        if (orig_stake) {
            value = value.plus(orig_stake.balance);
        }

        let stake = new Stake();
        stake.balance = value;

        this.stakes.put(from, stake);
    },

    /**
     * 从合约地址中提取token
     * value: 提取的数量
     */
    takeout: function (value) {
        let from = Blockchain.transaction.from;
        let amount = new BigNumber(value);

        let stake = this.stakes.get(from);
        if (!stake) {
            throw new Error('No recharge before!');
        }

        if (amount.gt(stake.balance)) {
            throw new Error('Insufficient balance.');
        }

        let result = Blockchain.transfer(from, amount);
        if (!result) {
            throw new Error('transfer failed.');
        }
        Event.Trigger('TakeOut', {
            Transfer: {
                from: Blockchain.transaction.to,
                to: from,
                value: amount.toString()
            }
        });

        stake.balance = stake.balance.sub(amount);
        this.stakes.put(from, stake);
    },

    /**
     * 查询余额
     */
    balanceOf: function () {
        let from = Blockchain.transaction.from;
        let stake = this.stakes.get(from);
        if (stake) {
            return stake.balance;
        }
        return new BigNumber(0);
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        let result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },

    /**
     * 创建一期游戏
     * id: 每一期游戏的唯一code
     * startTime: 开始时间
     * endTime： 结束时间
     */
    createGame: function(id, startTime, endTime) {
        let owner = Blockchain.transaction.from;
        if (!this.verifyAddress(owner).valid) {
            throw new Error('Invalid address!');
        }
        let game = new MarketIndexGame();
        game.startTimeStr = startTime;
        game.endTimeStr = endTime;
        game.id = id;
        this.games.put(String(id), game);
        let gameIdsObj = JSON.parse(this.gameIds);
        gameIdsObj.push(id);
        this.gameIds = JSON.stringify(gameIdsObj);

        return game;
    },

    /**
     * 投注
     * gameId: 每一期游戏的唯一code
     * money: 投注的金额
     * expect: 投注的类型('up','down','equal')=>(涨、跌、平)
     */
    bet: function(gameId, money, expect) {
        // 投注的钱包
        let betWallet = Blockchain.transaction.from;
        let game = this.games.get(String(gameId));
        // 投注的钱包的资产信息
        let stake = this.stakes.get(betWallet);
        if (!stake || stake.balance.lt(new BigNumber(money))) {
            throw new Error('余额不足，请先充值！');
        }
        if (game.state != 'init') {
            throw new Error('抱歉，投注时间已过, 欢迎参加下期竞猜！');
        }
        var money = new BigNumber(money);
        let betInfo = { wallet: betWallet, money: money };
        if (expect === 'up') {
            game.upInfos.push(betInfo);
            game.upTotalMoney = game.upTotalMoney.plus(money);
        } else if (expect === 'down') {
            game.downInfos.push(betInfo);
            game.downTotalMoney = game.downTotalMoney.plus(money);
        } else if (expect === 'equal') {
            game.equalInfos.push(betInfo);
            game.equalTotalMoney = game.equalTotalMoney.plus(money);
        } else {
            throw new Error('无效的预期' + expect);
        }
        stake.balance = stake.balance.sub(money);
        stake.betInfos.push({ id: gameId, expect: expect, money: money });

        this.stakes.put(betWallet, stake);
        this.games.put(String(gameId), game);
        return { result: 'success' };
    },

    /**
     * 游戏开始
     * gameId: 每一期游戏的唯一code
     * index: 开盘指数
     */
    gameStart: function(gameId, index) {
        let game = this.games.get(String(gameId));
        if (!game) {
            throw new Error('Invalid game!');
        }
        if (game.state === 'init') {
            game.state = 'start';
            game.startIndex = index;
            this.games.put(String(gameId), game);
        }
    },

    /**
     * 游戏结束
     * gameId: 每一期游戏的唯一code
     * index: 收盘指数
     */
    gameEnd: function(gameId, index) {
        let game = this.games.get(String(gameId));
        if (!game) {
            throw new Error('Invalid game!');
        }
        if (game.state === 'start') {
            game.state = 'end';
            // 平
            let profit;
            let winners;
            if (game.startIndex == index) {
                profit = game.upTotalMoney.plus(profit.downTotalMoney);
                winners = game.equalInfos;
            }
            // 涨
            else if (game.startIndex < index) {
                profit = game.downTotalMoney.plus(game.equalTotalMoney);
                winners = game.upInfos;
            }
            // 跌
            else {
                profit = game.equalTotalMoney.plus(game.upTotalMoney);
                winners = game.downInfos;
            }
            // 结算
            if (winners.length > 0) {
                let profitPerWallet = profit.dividedBy(new BigNumber(winners.length));
                for (let i = 0; i < winners.length; ++i) {
                    let stake = this.stakes.get(winners[i].wallet);
                    stake.balance = stake.balance.plus(winners[i].money).plus(profitPerWallet);
                    this.stakes.put(winners[i].wallet, stake);
                }
            } else {
                this.balance = new BigNumber(this.balance).plus(new BigNumber(profit));
            }
            this.games.put(String(gameId), game);
            return { result: 'success' };
        }
    },

    /**
     * 获取可约可支配的token数量
     */
    freeBalance: function() {
        return this.balance;
    },

    gameNums: function() {
        let gameIdsObj = JSON.parse(this.gameIds);
        return gameIdsObj.length;
    },

    /**
     * 根据状态获取游戏列表
     * state: undefined || 'init' || 'start' || 'end'
     */
    getGames: function(state) {
        let result = [];
        let gameIdsObj = JSON.parse(this.gameIds);
        for (let i = 0; i < gameIdsObj.length; ++i) {
            let game = this.games.get(gameIdsObj[i]);
            if (!!state && state != game.state) {
                game = null;
            }
            if (game) {
                result.push(game);
            }
        }
        return result;
    },

    /**
     * 根据id获取游戏信息
     * id: ["113", "23423"] || "1235"
     */
    getGame: function(id) {
        let result = [];
        if (id instanceof Array) {
            for (let i = 0; i < id.length; ++i) {
                result.push(this.games.get(id[i]));
            }
        } else {
            result.push(this.games.get(id));
        }
        return result;
    },

    /**
     * 获取用户的投注信息
     * wallet: 用户钱包地址
     */
    getBetInfo: function(wallet) {
        let stake = this.stakes.get(String(wallet));
        if (stake) {
            return stake.betInfos;
        } else {
            return [];
        }
    }

};

module.exports = MarketIndexGuessContract;
