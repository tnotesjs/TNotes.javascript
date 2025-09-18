// index.js 入口
const util = require('./util.js')
const Poker = require('./poker.js')

/* 1. 初始化一副牌 */
const pokers = [] // 一副牌

const joker = new Poker(null, 14) // 小王
const JOKER = new Poker(null, 15) // 大王

// 添加大小王
pokers.push(joker, JOKER)

// 添加除了大小王外的 52 张牌
for (let i = 1; i <= 13; i++) {
  // 遍历数字 1-52
  for (let j = 1; j <= 4; j++) {
    // 遍历 color 扑克牌花色
    const p = new Poker(j, i)
    pokers.push(p.toString())
  }
}

/* 2. 洗牌 */
util.sortRandom(pokers)
// console.log(pokers);

/* 3. 发牌 */
const user1 = pokers.slice(0, 17) // [0, 17)
const user2 = pokers.slice(17, 34) // [17, 34)
const user3 = pokers.slice(34, 51) // [34, 51)
const desk = pokers.slice(51, 54) // [51, 54)

console.log('user1', user1.map((p) => p + '  ').join(''))
console.log('user2', user2.map((p) => p + '  ').join(''))
console.log('user3', user3.map((p) => p + '  ').join(''))
console.log('desk', desk.map((p) => p + '  ').join(''))
