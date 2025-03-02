if ('') {
  console.log('true')
} else {
  console.log('false')
}

// 布尔值往往用于程序流程的控制
// 上面代码中，if 命令后面的判断条件，预期应该是一个布尔值，
// 所以 JS 自动将空字符串，转为布尔值 false，导致程序进入 else 代码块，所以输出 'false'。
