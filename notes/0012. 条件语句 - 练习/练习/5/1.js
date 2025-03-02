var fist = '剪刀'

if (fist === '剪刀' || fist === '石头' || fist === '布') {
  // 1. 模拟计算机出拳
  var rad = Math.random() // 生成一个 0~1 之间的随机数
  var pcFist // 计算机出拳结果
  if (rad < 0.3333) {
    pcFist = '剪刀'
  } else if (rad < 0.6666) {
    pcFist = '石头'
  } else {
    pcFist = '布'
  }
  // 2. 比较胜负
  console.log(`你的出拳：${fist}, 电脑出拳：${pcFist}`)
  if (
    (fist === '剪刀' && pcFist === '布') ||
    (fist === '布' && pcFist === '石头') ||
    (fist === '石头' && pcFist === '剪刀')
  ) {
    console.log('你胜利了！')
  } else if (fist === pcFist) {
    console.log('平局')
  } else {
    console.log('电脑胜利！')
  }
} else {
  console.log('输入有误')
}
