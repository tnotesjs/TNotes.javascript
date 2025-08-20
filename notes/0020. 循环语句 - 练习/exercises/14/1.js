console.log('游戏开始')

let currentRound = 1 // 当前轮次
let computerScore = 0 // 电脑分数
let userScore = 0 // 用户分数

while (true) {
  if (currentRound > 10) break

  console.log(`==============第${currentRound}轮==============`)
  console.log(`电脑：${computerScore}分，玩家：${userScore}分`)

  // 用户出拳
  let userChoice = Math.random()
  if (userChoice < 0.3333) {
    userChoice = '剪刀'
  } else if (userChoice < 0.6666) {
    userChoice = '石头'
  } else {
    userChoice = '布'
  }

  if (userChoice === null) {
    // 取消游戏
    break
  }

  // 验证出拳有效性
  if (userChoice !== '剪刀' && userChoice !== '石头' && userChoice !== '布') {
    console.log('出拳无效，请重新出拳！')
    continue
  }

  console.log(`你的出拳：${userChoice}`)

  // 电脑随机出拳
  let computerChoice = Math.random()
  if (computerChoice < 0.3333) {
    computerChoice = '剪刀'
  } else if (computerChoice < 0.6666) {
    computerChoice = '石头'
  } else {
    computerChoice = '布'
  }

  console.log(`电脑出拳：${computerChoice}`)

  // 判断胜负
  if (
    (userChoice === '剪刀' && computerChoice === '布') ||
    (userChoice === '布' && computerChoice === '石头') ||
    (userChoice === '石头' && computerChoice === '剪刀')
  ) {
    // 用户胜利
    userScore++
    console.log('你赢了！')
  } else if (userChoice === computerChoice) {
    console.log('平局')
  } else {
    // 电脑胜利
    computerScore++
    console.log('电脑胜利！')
  }

  // 轮次增加
  currentRound++
}

console.log('==============游戏结束==============')
console.log(`电脑：${computerScore}分，玩家：${userScore}分`)
