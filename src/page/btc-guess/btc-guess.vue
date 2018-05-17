<template>
<div class="page-btc-guess cm-pd-30 cm-mg-h-auto">
    <h2>猜BTC趋势</h2>
    <div class="guess-info cm-mg-t-30 cm-pd-v-20">
        <div class="current-round">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="grid-content">
                        <label>本期</label>
                        <span v-if="curRound.id">({{curRound.id}})</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content">
                        <label>BTC开盘价：</label>
                        <span>{{curRound.startIndex}}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content">
                        <label>BTC收盘价：</label>
                        <span>--</span>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div class="last-round cm-mg-t-20">
            <el-row :gutter="20">
                <el-col :span="6">
                    <div class="grid-content">
                        <label>上一期</label>
                        <span v-if="lastRound.id">({{lastRound.id}})</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content">
                        <label>BTC开盘价：</label>
                        <span>{{lastRound.startIndex}}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content">
                        <label>BTC收盘价：</label>
                        <span>{{lastRound.endIndex}}</span>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="grid-content">
                        <label>竞猜结果：</label>
                        <span>{{lastRoundRet}}</span>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
    <div class="my-wallet cm-mg-t-10">
        <label>我的钱包地址：</label>
        <el-input class="cm-mg-v-10"
            placeholder="请输入钱包地址"
            v-model="myWalletAddr"
            :disabled="bIsAddrValid"
            clearable>
        </el-input>
        <el-button type="primary" @click="addMyAddr"
            :disabled="bIsAddrValid">添加</el-button>
    </div>
    <div class="join-wallet cm-mg-t-10" style="display:none;">
        <label>我的游戏余额（NAS）：</label>
        <span>{{myGameBalance}}</span>
    </div>
    <div class="join-block cm-mg-t-20">
        <div class="guess-title">参加下一轮</div>
        <div class="join-wallet cm-mg-t-10">
            <label>我的钱包地址：</label>
            <span>{{myWalletAddr}}</span>
        </div>
        <div class="join-amount cm-mg-t-10">
            <label>投注金额（NAS）：</label>
            <span>{{BET_AMOUNT}}</span>
            <el-button type="primary" @click="recharge"
                :disabled="!bIsAddrValid" style="display:none;">充值</el-button>
        </div>
        <div class="join-amount cm-mg-t-10">
            <label>竞猜内容：</label>
            <el-radio-group v-model="guessRet">
                <el-radio :label="GUESS_RET.RISE">涨</el-radio>
                <el-radio :label="GUESS_RET.DRAW">平</el-radio>
                <el-radio :label="GUESS_RET.FALL">跌</el-radio>
            </el-radio-group>
        </div>
        <div class="do-join cm-mg-t-10">
            <el-button type="primary" @click="bet"
                :disabled="!bIsAddrValid">参与下一期竞猜</el-button>
        </div>
    </div>
    <div class="my-guess-history-block cm-mg-t-20">
        <div class="guess-title">我的竞猜历史</div>
        <el-table
            :data="myGuessHistory"
            stripe
            style="width: 100%">
            <el-table-column
            prop="id"
            label="竞猜期号">
            </el-table-column>
            <el-table-column
            prop="profit"
            label="竞猜收益(NAS)"
            :formatter="formatNAS">
            </el-table-column>
            <el-table-column
            prop="expect"
            label="我的投注"
            :formatter="guessRetFormatter">
            </el-table-column>
            </el-table-column>
            <el-table-column
            prop="startIndex"
            label="BTC开盘价">
            </el-table-column>
            <el-table-column
            prop="endIndex"
            label="BTC收盘价">
            </el-table-column>
        </el-table>
    </div>
</div>
</template>
<script>
import {ADDR_CONTRACT, GUESS_RET, UNIT_NAS_WEI} from 'CONFIG_BASE/config';
import {ContractAPI} from 'COMMON_SERVICE/contract/contract';
import nebulas from 'nebulas';

const contract = new ContractAPI(ADDR_CONTRACT);
const BET_AMOUNT = 0.001;

export default {
    data () {
        return {
            BET_AMOUNT: BET_AMOUNT,
            GUESS_RET: GUESS_RET,
            bIsAddrValid: false,
            myWalletAddr: '',
            myGameBalance: '--',
            guessRet: GUESS_RET.RISE,
            myGuessHistory: [],
            lastRound: {},
            curRound: {},
            nextRound: {}
        }
    },
    computed: {
        lastRoundRet () {
            if (!(this.lastRound && this.lastRound.startIndex && this.lastRound.endIndex)) {
                return '--';
            }

            if (this.lastRound.endIndex - this.lastRound.startIndex > 0) {
                return '涨';
            }

            if (this.lastRound.endIndex - this.lastRound.startIndex === 0) {
                return '平';
            }

            if (this.lastRound.endIndex - this.lastRound.startIndex < 0) {
                return '跌';
            }
        }
    },
    methods: {
        addMyAddr () {
            this.bIsAddrValid = nebulas.Account.isValidAddress(this.myWalletAddr);

            // this.getBalance();
            this.getLastRound();
            this.getCurRound();
            this.getNextRound();
            this.getBetInfo();

            setInterval(() => {
                this.getLastRound();
                this.getCurRound();
                this.getNextRound();
                this.getBetInfo();
            }, 2000);
        },
        formatNAS(row, col, cellVal) {
            if (row.startIndex === '-' || row.endIndex === '-') {
                return '待结算'
            }

            return cellVal / 1e18 || 0;
        },
        guessRetFormatter (row, col, cellVal) {
            let val = cellVal;
            if (val === GUESS_RET.RISE) {
                return '涨'
            }

            if (val === GUESS_RET.DRAW) {
                return '平'
            }

            if (val === GUESS_RET.FALL) {
                return '跌'
            }
        },
        getLastRound() {
            if (!this.bIsAddrValid) {
                return;
            }
            contract.call(this.myWalletAddr, 'getGames', 'end')
            .then((res) => {
                this.lastRound = (res && res.length && res[res.length - 1]) || {};
            });
        },
        getCurRound() {
            if (!this.bIsAddrValid) {
                return;
            }
            contract.call(this.myWalletAddr, 'getGames', 'start')
            .then((res) => {
                this.curRound = (res && res.length && res[res.length - 1]) || {};
            });
        },
        getNextRound() {
            if (!this.bIsAddrValid) {
                return;
            }
            contract.call(this.myWalletAddr, 'getGames', 'init')
            .then((res) => {
                this.nextRound = (res && res[0]) || {};
            });
        },
        recharge () {
            contract.callByWallet(BET_AMOUNT, 'save', {}).then((res) => {
                this.getBalance();
            });
        },
        bet () {
            if (!(this.nextRound && this.nextRound.id)) {
                console.warn('没有可以投注的局')
                return;
            }

            let payAmount = UNIT_NAS_WEI * BET_AMOUNT;

            contract.callByWallet(BET_AMOUNT, 'bet', {}, this.nextRound.id, this.guessRet)
            .then((res) => {
                alert('投注成功!');
            });
        },
        getBalance() {
            if (this.bIsAddrValid) {
                contract.call(this.myWalletAddr, 'balanceOf')
                .then((data) => {
                    this.myGameBalance = data/1e18;
                });
            }
        },
        getBetInfo() {
            if (this.bIsAddrValid) {
                contract.call(this.myWalletAddr, 'getBetInfo', this.myWalletAddr)
                .then((data) => {
                    let betInfo = data && data.reverse();

                    if (betInfo.length > 5) {
                        betInfo.length = 5;
                    }

                    let arrBetId = [];
                    betInfo.forEach((bet) => {
                        arrBetId.push(bet.id);
                    });

                    contract.call(this.myWalletAddr, 'getGame', arrBetId)
                    .then((res) => {
                        let roundInfo = res;

                        for (let i = 0; i < roundInfo.length; ++i) {
                            betInfo[i] = Object.assign({}, betInfo[i], roundInfo[i]);
                        }

                        this.myGuessHistory = betInfo;
                    });
                });
            }
        }
    }
};
</script>
<style lang="scss">
.page-btc-guess {
}
</style>


