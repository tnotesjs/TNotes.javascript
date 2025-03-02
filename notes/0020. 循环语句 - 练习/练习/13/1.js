for (var i = 1; i <= 9; i++) { // 每遍历一次，输出 1 行。
  // 拼接 i 个等式
  var str = ''
  for (var j = 1; j <= i; j++) {
    str += `${j}*${i}=${i * j}\t`
  }
  console.log(str)
}
