var x = 1

switch (x) {
  case 1:
    console.log('x 等于1')
  case 2:
    console.log('x 等于2')
  default:
    console.log('x 等于其他值')
}

// 在该 demo 中，case 代码块之中没有 break 语句，
// 这将会导致程序不会跳出 switch 结构，而会一直执行下去。

// 最终输出结果：
// x 等于1
// x 等于2
// x 等于其他值
