console.log('start')
top: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break top
    console.log('i=' + i + ', j=' + j)
  }
}
console.log('end')

// 上面代码为一个双重循环区块
// break 命令后面加上了 top 标签（注意，top 不用加引号）
// 满足条件时，直接跳到 top 位置，即跳出双层循环。

// 最终输出结果：
// start
// i=0, j=0
// i=0, j=1
// i=0, j=2
// i=1, j=0
// end
