function countdown(n) {
  while (n-- > 0) console.log(n)
}
countdown(3)
// 2
// 1
// 0

// 注意：--> 只有在行首，才会被当成单行注释，否则会当作正常的运算。
// 上面代码中，n --> 0 实际上会当作 n-- > 0，因此输出 2、1、0。
