var x = 1

switch (x) {
  case 1:
    console.log('x 等于1')
    break // 加上 break 语句
  case 2:
    console.log('x 等于2')
    break // 加上 break 语句
  default:
    console.log('x 等于其他值')
}

// 正确写法应该是在每个 case 代码块末尾加上 break 语句。

// 最终输出结果：
// x 等于1