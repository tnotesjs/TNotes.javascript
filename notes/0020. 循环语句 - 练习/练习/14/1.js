console.log('游戏开始')
var round = 1, // 轮次
  pcScore = 0, // 系统分数
  playerScore = 0 // 玩家分数
while (true) {
  if (round === 10) break
  console.log(`==============第${round}轮==============`)
  console.log(`系统：${pcScore}分，玩家：${playerScore}分`)

  var fist = Math.random() // 模拟玩家出拳
  if (fist < 0.3333) {
    fist = '剪刀'
  } else if (fist < 0.6666) {
    fist = '石头'
  } else {
    fist = '布'
  }

  if (fist === null) {
    // 取消
    break
  }
  // 没有取消
  if (fist !== '剪刀' && fist !== '石头' && fist !== '布') {
    // 出拳无效
    console.log('出拳无效，请重新出拳！')
    continue
  }
  // 出拳有效
  console.log(`你的出拳：${fist}`)

  var pcFist = Math.random() // 系统随机出拳
  if (pcFist < 0.3333) {
    pcFist = '剪刀'
  } else if (pcFist < 0.6666) {
    pcFist = '石头'
  } else {
    pcFist = '布'
  }
  
  console.log(`系统出拳：${pcFist}`)
  // 判断胜负
  if (
    (fist === '剪刀' && pcFist === '布') ||
    (fist === '布' && pcFist === '石头') ||
    (fist === '石头' && pcFist === '剪刀')
  ) {
    // 玩家胜利
    playerScore++
    console.log('你赢了！')
  } else if (fist === pcFist) {
    console.log('平局')
  } else {
    pcScore++
    console.log('系统胜利！')
  }
  // 轮次 + 1
  round++
}

console.log('==============游戏结束==============')
console.log(`系统：${pcScore}分，玩家：${playerScore}分`)
