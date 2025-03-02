console.log('start')
top: for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 3; j++) {
    if (i === 1 && j === 1) continue top
    console.log('i=' + i + ', j=' + j)
  }
}
console.log('end')

// continue 语句也可以与标签配合使用。

// 最终输出结果：
// start
// i=0, j=0
// i=0, j=1
// i=0, j=2
// i=1, j=0
// i=2, j=0
// i=2, j=1
// i=2, j=2
// end