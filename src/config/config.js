// const ADDR_CONTRACT = 'n1ii4pYKGQMBg15s2hxJW8UTCKixGFEvYTs'; // 测试链合约地址
const ADDR_CONTRACT = 'n1uGs25yj3XT8daUx3Q5MaawxafLmGZR3TZ'; // 主链合约地址
const NAS_BASE_AMOUNT = 0.1; // 猜走势基准NAS数量
const GUESS_RET = {
    RISE: 'up',
    DRAW: 'equal',
    FALL: 'down'
};

const NEBULAS_CHAIN = {
    TEST: 'https://testnet.nebulas.io',
    PRO: 'https://mainnet.nebulas.io'
};

const UNIT_NAS_WEI = 1e6;

export { ADDR_CONTRACT, NAS_BASE_AMOUNT, GUESS_RET, NEBULAS_CHAIN, UNIT_NAS_WEI };