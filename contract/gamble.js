'use strict';

// 资金
let Stake = function(json) {
    if (json) {
        let o = JSON.parse(json);
        this.balance = new BigNumber(o.balance);
    } else {
        this.balance = new BigNumber(0);
    }
};
Stake.prototype.toString = function() {
    return JSON.stringify(this);
};

// 对赌局
let Gambling = function(json) {
    if (json) {
        let o = JSON.parse(json);
        this.owner = o.owner;
        this.smaller = (o.smaller);
        this.money = new BigNumber(o.money);
        this.state = o.state || 'ongoing';
        this.guesser = o.guesser || '';
    }
    else {
        this.owner = '';
        this.smaller = false;
        this.money = new BigNumber(0);
        this.state = 'ongoing';
        this.guesser = '';
    }
};
Gambling.prototype.toString = function() {
    return JSON.stringify(this);
};

let GamblingContract = function () {
    LocalContractStorage.defineMapProperty(this, 'stakes', {
        parse: function (text) {
            return new Stake(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineMapProperty(this, 'gamblings', {
        parse: function (text) {
            return new Gambling(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, 'gamberNum', null);
};

// save value to contract, only after height of block, users can takeout
GamblingContract.prototype = {
    init: function () {
        this.gamberNum = 0;
    },

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

    balanceOf: function () {
        let from = Blockchain.transaction.from;
        return this.stakes.get(from);
    },

    verifyAddress: function (address) {
        // 1-valid, 0-invalid
        let result = Blockchain.verifyAddress(address);
        return {
            valid: result == 0 ? false : true
        };
    },

    createGambling: function(point, money) {
        let owner = Blockchain.transaction.from;

        let gambling = new Gambling();
        gambling.money = new BigNumber(money);
        let stake = this.stakes.get(owner);
        if (point < 3 || point > 18) {
            throw new Error('point should be in the rang of [3, 18]!');
        }
        if (gambling.money.lt(new BigNumber(0)) || !stake) {
            throw new Error('stake should not less than 0!');
        }
        if (gambling.money.gt(stake.balance)) {
            throw new Error('stake shold not bigger than your balance!');
        }
        gambling.owner = String(owner);
        gambling.smaller = (point >= 3 && point < 10);

        stake.balance = stake.balance.sub(gambling.money);
        this.stakes.put(owner, stake);
        this.gamblings.put(String(this.gamberNum++), gambling);
        return gambling;
    },

    cancelGambling: function(number) {
        let owner = Blockchain.transaction.from;
        let gambling = this.gamblings.get(String(number));
        let stake = this.stakes.get(owner);
        if (!!gambling && gambling.owner == owner && gambling.state == 'ongoing') {
            gambling.state = 'cancel';
            stake.balance = stake.balance.plus(gambling.money);
            this.stakes.put(owner, stake);
            this.gamblings.put(String(number), gambling);
        }
        return gambling;
    },

    guess: function(number, point) {
        let guesser = Blockchain.transaction.from;
        let gambling = this.gamblings.get(String(number));
        let stake = this.stakes.get(guesser);
        let ownerStake = this.stakes.get(gambling.owner);
        if (!stake) {
            throw new Error('You should recharge first!');
        }
        if (!gambling) {
            throw new Error('The gambling is not valid!');
        }
        if (gambling.owner == guesser) {
            throw new Error('Should not gambling with self!');
        }
        if (stake.balance.lt(gambling.money)) {
            throw new Error('Your balance is less than the stake, recharge first!');
        }
        if (gambling.state != 'ongoing') {
            throw new Error('The gambling is canceled or finished!');
        }
        let smaller = (point >= 3 && point < 10);
        let result =  { guess: gambling.state, point: gambling.smaller };
        gambling.guesser = guesser;
        if (smaller == gambling.smaller) {
            stake.balance = stake.balance.plus(gambling.money);
            gambling.state = 'failed';
            result.guess = 'success';
        } else {
            ownerStake.balance = ownerStake.balance.plus(gambling.money).plus(gambling.money);
            gambling.state = 'success';
            result.guess = 'failed';
            stake.balance = stake.balance.sub(gambling.money);
        }
        this.stakes.put(guesser, stake);
        this.stakes.put(gambling.owner, ownerStake);
        this.gamblings.put(String(number), gambling);

        return result;
    },

    gamblingNumber: function() {
        return this.gamberNum;
    },

    getGamblings: function(owner, state) {
        let result = [];
        for (let i = 0; i < this.gamberNum; ++i) {
            let gambling = this.gamblings.get(String(i));
            if (!!owner && owner != gambling.owner) {
                gambling = null;
            }
            if (!!gambling && !!state && state != gambling.state) {
                gambling = null;
            }
            if (gambling) {
                let o = { owner: gambling.owner, money: gambling.money, state: gambling.state, guesser: gambling.guesser };
                if (gambling.state == 'failed' || gambling.state == 'success') {
                    o.smaller = gambling.smaller;
                }
                result.push(o);
            }
        }
        return result;
    }
};

module.exports = GamblingContract;